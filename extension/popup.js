document.addEventListener('DOMContentLoaded', async () => {
    const submitBtn    = document.getElementById('submit-btn');
    const descInput    = document.getElementById('description');
    const projInput    = document.getElementById('project-id');
    const statusMsg    = document.getElementById('status-msg');
    const previewText  = document.getElementById('preview-text');
    const canvas       = document.getElementById('annotation-canvas');
    const ctx          = canvas.getContext('2d');
    const hintEl       = document.getElementById('annotation-hint');
    const clearBtn     = document.getElementById('clear-btn');

    const API_URL = 'https://bugly-backend.vercel.app/api';

    let captureDataUrl = null;   // original screenshot
    let baseImage      = null;   // Image object
    let pageMetadata   = null;
    let annotation     = null;   // { x, y, w, h } in canvas coords
    let drawing        = false;
    let startX = 0, startY = 0;

    // Load saved project ID
    const { savedProjectId } = await chrome.storage.local.get('savedProjectId');
    if (savedProjectId) projInput.value = savedProjectId;

    // Get tab metadata
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        pageMetadata = await chrome.tabs.sendMessage(tab.id, { action: 'getMetadata' });
    } catch {
        pageMetadata = { url: tab.url, browser: navigator.userAgent, os: navigator.platform, screen: 'Unknown' };
    }

    // Capture screenshot
    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
        if (chrome.runtime.lastError || !response?.dataUrl) {
            previewText.innerText = 'Screenshot failed.';
            previewText.style.color = '#dc2626';
            submitBtn.disabled = false;
            return;
        }

        captureDataUrl = response.dataUrl;
        baseImage = new Image();
        baseImage.onload = () => {
            // Size canvas to match display width maintaining aspect ratio
            const displayW = canvas.parentElement.clientWidth;
            const scale    = displayW / baseImage.width;
            canvas.width   = baseImage.width;
            canvas.height  = baseImage.height;
            canvas.style.width  = displayW + 'px';
            canvas.style.height = (baseImage.height * scale) + 'px';

            drawBase();
            previewText.style.display = 'none';
            canvas.style.display = 'block';
            hintEl.classList.add('visible');
            submitBtn.disabled = false;
        };
        baseImage.src = captureDataUrl;
    });

    // ── Draw helpers ──────────────────────────────────────────────
    function drawBase() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImage, 0, 0);
    }

    function drawAnnotation(rect) {
        if (!rect) return;
        const { x, y, w, h } = rect;

        // Dim everything outside the selection
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cut out the selected area (show original)
        ctx.drawImage(baseImage, x, y, w, h, x, y, w, h);

        // Red border
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth   = Math.max(3, canvas.width * 0.004);
        ctx.strokeRect(x, y, w, h);

        // Corner dots
        const r = Math.max(5, canvas.width * 0.007);
        ctx.fillStyle = '#ef4444';
        [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Label tag
        const label = ' Bug Area ';
        const fontSize = Math.max(11, canvas.width * 0.018);
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        const textW = ctx.measureText(label).width + 8;
        const tagH  = fontSize + 8;
        const tagX  = x;
        const tagY  = y > tagH + 4 ? y - tagH - 4 : y + 4;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, textW, tagH, 4);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(label, tagX + 4, tagY + tagH - 5);
    }

    // ── Canvas coords from mouse event ────────────────────────────
    function getCanvasPos(e) {
        const rect  = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top)  * scaleY,
        };
    }

    // ── Mouse events ──────────────────────────────────────────────
    canvas.addEventListener('mousedown', e => {
        const pos = getCanvasPos(e);
        startX  = pos.x;
        startY  = pos.y;
        drawing = true;
        annotation = null;
    });

    canvas.addEventListener('mousemove', e => {
        if (!drawing) return;
        const pos = getCanvasPos(e);
        const w = pos.x - startX;
        const h = pos.y - startY;
        drawBase();
        drawAnnotation({ x: startX, y: startY, w, h });
    });

    canvas.addEventListener('mouseup', e => {
        if (!drawing) return;
        drawing = false;
        const pos = getCanvasPos(e);
        const w = pos.x - startX;
        const h = pos.y - startY;
        if (Math.abs(w) < 5 || Math.abs(h) < 5) {
            // Too small — ignore
            drawBase();
            annotation = null;
            clearBtn.classList.remove('visible');
            return;
        }
        annotation = { x: startX, y: startY, w, h };
        drawAnnotation(annotation);
        clearBtn.classList.add('visible');
    });

    canvas.addEventListener('mouseleave', () => {
        if (drawing) {
            drawing = false;
            if (annotation) drawAnnotation(annotation);
            else drawBase();
        }
    });

    // ── Clear button ──────────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        annotation = null;
        drawBase();
        clearBtn.classList.remove('visible');
    });

    // ── Submit ────────────────────────────────────────────────────
    submitBtn.addEventListener('click', async () => {
        const description = descInput.value.trim();
        const projectId   = projInput.value.trim();

        if (!description || !projectId) {
            statusMsg.innerText   = 'Project ID and Description are required.';
            statusMsg.className   = 'status error';
            statusMsg.style.display = 'block';
            return;
        }

        await chrome.storage.local.set({ savedProjectId: projectId });
        submitBtn.disabled  = true;
        submitBtn.innerText = 'Submitting...';
        statusMsg.style.display = 'none';

        // Export canvas (with annotation drawn on it) as JPEG
        const screenshotData = captureDataUrl
            ? canvas.toDataURL('image/jpeg', 0.7)
            : null;

        const payload = {
            projectId,
            title: description.split('\n')[0].substring(0, 80),
            description,
            screenshotData,
            url:     pageMetadata.url,
            browser: pageMetadata.browser,
            os:      pageMetadata.os,
            screen:  pageMetadata.screen,
        };

        try {
            const res = await fetch(`${API_URL}/bugs`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });

            if (res.ok) {
                statusMsg.innerText     = '✓ Report sent successfully!';
                statusMsg.className     = 'status';
                statusMsg.style.display = 'block';
                descInput.value = '';
                setTimeout(() => window.close(), 2000);
            } else {
                const { error } = await res.json().catch(() => ({}));
                throw new Error(error || `HTTP ${res.status}`);
            }
        } catch (err) {
            statusMsg.innerText     = err.message || 'Failed to submit. Check connection.';
            statusMsg.className     = 'status error';
            statusMsg.style.display = 'block';
            submitBtn.disabled  = false;
            submitBtn.innerText = 'Submit Report';
        }
    });
});
