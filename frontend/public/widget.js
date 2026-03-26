(function () {
  const scriptTag = document.currentScript;
  const projectId = scriptTag?.getAttribute('data-project-id') || window.BUGLY_PROJECT_ID;
  const API_URL = scriptTag?.getAttribute('data-api-url') || window.BUGLY_API_URL || 'http://localhost:5000/api';
  const pos = (scriptTag?.getAttribute('data-position') || 'bottom-right').toLowerCase();

  const isBottom = pos.includes('bottom');
  const isRight  = pos.includes('right');

  const containerPos = [
    isBottom ? 'bottom:24px' : 'top:24px',
    isRight  ? 'right:24px'  : 'left:24px'
  ].join(';');

  // Panel opens away from the nearest edge, aligned to button edge
  const panelPos = [
    isBottom ? 'bottom:52px' : 'top:52px',
    isRight  ? 'right:0'     : 'left:0'
  ].join(';');

  const bugIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c-2.1.2-3.67 1.9-3.67 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`;

  const widgetHtml = `
    <div id="bugly-widget-container" style="position:fixed;${containerPos};z-index:99999;font-family:system-ui,-apple-system,sans-serif;">

      <!-- Trigger pill button -->
      <button id="bugly-open-btn" style="
        display:flex;align-items:center;gap:8px;
        background:#2563eb;color:white;border:none;
        padding:10px 18px 10px 14px;border-radius:999px;
        cursor:pointer;font-size:14px;font-weight:600;
        box-shadow:0 4px 14px rgba(37,99,235,0.45);
        transition:transform 0.15s,box-shadow 0.15s;
        white-space:nowrap;
      "
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(37,99,235,0.55)'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 4px 14px rgba(37,99,235,0.45)'">
        ${bugIcon}
        Report a Bug
      </button>

      <!-- Form panel -->
      <div id="bugly-form-container" style="
        display:none;position:absolute;${panelPos};
        width:340px;background:white;border-radius:16px;
        box-shadow:0 20px 40px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.06);
        overflow:hidden;
      ">
        <!-- Header -->
        <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;background:#eff6ff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#2563eb;">
              ${bugIcon}
            </div>
            <div>
              <div style="font-weight:700;font-size:15px;color:#0f172a;">Report a Bug</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:1px;">Help us improve by reporting issues</div>
            </div>
          </div>
          <button id="bugly-close-btn" style="
            background:#f8fafc;border:none;color:#64748b;cursor:pointer;
            width:28px;height:28px;border-radius:8px;font-size:16px;
            display:flex;align-items:center;justify-content:center;
            transition:background 0.15s;
          "
          onmouseover="this.style.background='#f1f5f9'"
          onmouseout="this.style.background='#f8fafc'">✕</button>
        </div>

        <!-- Body -->
        <div style="padding:20px;">
          <!-- Title field -->
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">Title</label>
            <input id="bugly-title" type="text" placeholder="Short summary of the issue" style="
              width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;
              font-family:inherit;font-size:14px;color:#0f172a;box-sizing:border-box;
              outline:none;transition:border-color 0.15s;
            "
            onfocus="this.style.borderColor='#2563eb'"
            onblur="this.style.borderColor='#e2e8f0'" />
          </div>

          <!-- Description field -->
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">Description</label>
            <textarea id="bugly-description" rows="4" placeholder="What went wrong? Steps to reproduce..." style="
              width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;
              resize:none;font-family:inherit;font-size:14px;color:#0f172a;
              box-sizing:border-box;outline:none;transition:border-color 0.15s;line-height:1.5;
            "
            onfocus="this.style.borderColor='#2563eb'"
            onblur="this.style.borderColor='#e2e8f0'"></textarea>
          </div>

          <!-- Screenshot toggle -->
          <label style="display:flex;align-items:center;gap:10px;margin-bottom:18px;cursor:pointer;padding:10px 12px;background:#f8fafc;border-radius:8px;border:1.5px solid #e2e8f0;">
            <input type="checkbox" id="bugly-include-screenshot" checked style="width:16px;height:16px;cursor:pointer;accent-color:#2563eb;" />
            <div>
              <div style="font-size:13px;font-weight:600;color:#0f172a;">Attach screenshot</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:1px;">You can annotate it before submitting</div>
            </div>
          </label>

          <!-- Submit -->
          <button id="bugly-submit-btn" style="
            width:100%;background:#2563eb;color:white;border:none;
            padding:11px;border-radius:8px;font-weight:600;font-size:14px;
            cursor:pointer;transition:background 0.15s;
          "
          onmouseover="this.style.background='#1d4ed8'"
          onmouseout="this.style.background='#2563eb'">Submit Report</button>

          <div id="bugly-status-msg" style="display:none;text-align:center;margin-top:14px;font-size:13px;color:#059669;font-weight:500;padding:10px;background:#f0fdf4;border-radius:8px;">
            ✓ Bug reported successfully!
          </div>
          <div id="bugly-error-msg" style="display:none;text-align:center;margin-top:12px;font-size:13px;color:#dc2626;padding:10px;background:#fef2f2;border-radius:8px;"></div>
        </div>

        <!-- Footer -->
        <div style="padding:10px 20px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:center;gap:4px;">
          <span style="font-size:11px;color:#cbd5e1;">Powered by</span>
          <span style="font-size:11px;font-weight:700;color:#2563eb;">Bugly</span>
        </div>
      </div>
    </div>

    <!-- Annotation overlay -->
    <div id="bugly-annotation-overlay" style="display:none;position:fixed;inset:0;z-index:999999;background:#0f172a;flex-direction:column;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#1e293b;border-bottom:1px solid #334155;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:8px;height:8px;background:#ef4444;border-radius:50%;animation:bugly-pulse 1.5s infinite;"></div>
          <span style="color:#e2e8f0;font-size:13px;font-family:system-ui,sans-serif;font-weight:500;">Drag to highlight the bug area &nbsp;·&nbsp; <span style="color:#94a3b8;">Click anywhere to start</span></span>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="bugly-annotation-clear" style="background:#334155;color:#cbd5e1;border:none;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;">Clear</button>
          <button id="bugly-annotation-skip" style="background:#334155;color:#cbd5e1;border:none;padding:7px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;">Skip Annotation</button>
          <button id="bugly-annotation-confirm" style="background:#2563eb;color:white;border:none;padding:7px 18px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Confirm & Submit</button>
        </div>
      </div>
      <div style="flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:16px;">
        <canvas id="bugly-annotation-canvas" style="max-width:100%;max-height:100%;cursor:crosshair;display:block;border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,0.1);"></canvas>
      </div>
    </div>
    <style>
      @keyframes bugly-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    </style>
  `;

  function loadHtml2Canvas(callback) {
    if (typeof window.html2canvas !== 'undefined') { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.onload = callback;
    s.onerror = () => { console.warn('Bugly: html2canvas failed'); callback(); };
    document.head.appendChild(s);
  }

  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  const openBtn       = document.getElementById('bugly-open-btn');
  const closeBtn      = document.getElementById('bugly-close-btn');
  const formContainer = document.getElementById('bugly-form-container');
  const submitBtn     = document.getElementById('bugly-submit-btn');
  const titleInput    = document.getElementById('bugly-title');
  const descInput     = document.getElementById('bugly-description');
  const statusMsg     = document.getElementById('bugly-status-msg');
  const errorMsg      = document.getElementById('bugly-error-msg');
  const checkbox      = document.getElementById('bugly-include-screenshot');
  const widgetContainer = document.getElementById('bugly-widget-container');
  const overlay       = document.getElementById('bugly-annotation-overlay');
  const canvas        = document.getElementById('bugly-annotation-canvas');
  const clearBtn      = document.getElementById('bugly-annotation-clear');
  const skipBtn       = document.getElementById('bugly-annotation-skip');
  const confirmBtn    = document.getElementById('bugly-annotation-confirm');
  const ctx           = canvas.getContext('2d');

  let baseImage = null, rect = null, dragging = false, startX = 0, startY = 0;

  function drawBase() {
    if (!baseImage) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  }

  function drawAnnotation(r) {
    drawBase();
    if (!r || r.w === 0 || r.h === 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(r.x, r.y, r.w, r.h);
    ctx.drawImage(baseImage, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    const dots = [[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]];
    ctx.fillStyle = '#ef4444';
    dots.forEach(([dx,dy]) => { ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2); ctx.fill(); });
    const label = 'Bug Area';
    ctx.font = 'bold 11px system-ui,sans-serif';
    const tw = ctx.measureText(label).width;
    const tagX = r.x, tagY = Math.max(r.y - 24, 2);
    const tagW = tw + 16, tagH = 20, tagR = 4;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(tagX+tagR,tagY); ctx.lineTo(tagX+tagW-tagR,tagY);
    ctx.quadraticCurveTo(tagX+tagW,tagY,tagX+tagW,tagY+tagR);
    ctx.lineTo(tagX+tagW,tagY+tagH); ctx.lineTo(tagX,tagY+tagH);
    ctx.lineTo(tagX,tagY+tagR);
    ctx.quadraticCurveTo(tagX,tagY,tagX+tagR,tagY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText(label, tagX+8, tagY+14);
  }

  function getCanvasPos(e) {
    const cr = canvas.getBoundingClientRect();
    return [(e.clientX-cr.left)*(canvas.width/cr.width), (e.clientY-cr.top)*(canvas.height/cr.height)];
  }

  canvas.addEventListener('mousedown', e => { [startX,startY]=getCanvasPos(e); dragging=true; rect=null; });
  canvas.addEventListener('mousemove', e => {
    if (!dragging) return;
    const [cx,cy] = getCanvasPos(e);
    rect = {x:Math.min(startX,cx),y:Math.min(startY,cy),w:Math.abs(cx-startX),h:Math.abs(cy-startY)};
    drawAnnotation(rect);
  });
  canvas.addEventListener('mouseup', () => { dragging=false; });
  canvas.addEventListener('mouseleave', () => { dragging=false; });
  clearBtn.addEventListener('click', () => { rect=null; drawBase(); });

  let pendingDescription = '', pendingTitle = '';

  function showAnnotation(dataUrl) {
    const img = new Image();
    img.onload = () => {
      baseImage = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      drawBase();
      overlay.style.display = 'flex';
    };
    img.src = dataUrl;
  }

  function hideAnnotation() {
    overlay.style.display = 'none';
    baseImage = null; rect = null;
  }

  skipBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    hideAnnotation();
    doSubmit(pendingTitle, pendingDescription, dataUrl);
  });

  confirmBtn.addEventListener('click', () => {
    if (rect) drawAnnotation(rect); else drawBase();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    hideAnnotation();
    doSubmit(pendingTitle, pendingDescription, dataUrl);
  });

  async function doSubmit(title, description, screenshotData) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    errorMsg.style.display = 'none';

    const payload = {
      projectId,
      title: title || description.split('\n')[0].substring(0, 80),
      description,
      screenshotData,
      url: window.location.href,
      browser: navigator.userAgent,
      os: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`
    };

    try {
      const res = await fetch(`${API_URL}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        statusMsg.style.display = 'block';
        titleInput.value = '';
        descInput.value = '';
        setTimeout(() => {
          formContainer.style.display = 'none';
          openBtn.style.display = 'flex';
          statusMsg.style.display = 'none';
        }, 3000);
      } else {
        errorMsg.innerText = data.error || 'Failed to submit. Please try again.';
        errorMsg.style.display = 'block';
      }
    } catch {
      errorMsg.innerText = 'Network error. Please try again.';
      errorMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Submit Report';
    }
  }

  openBtn.addEventListener('click', () => {
    formContainer.style.display = 'block';
    openBtn.style.display = 'none';
    statusMsg.style.display = 'none';
    errorMsg.style.display = 'none';
  });

  closeBtn.addEventListener('click', () => {
    formContainer.style.display = 'none';
    openBtn.style.display = 'flex';
  });

  submitBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!description) {
      descInput.style.borderColor = '#ef4444';
      setTimeout(() => descInput.style.borderColor = '#e2e8f0', 2000);
      return;
    }
    if (!projectId) { alert('Bugly: No Project ID configured.'); return; }

    errorMsg.style.display = 'none';
    submitBtn.disabled = true;

    if (!checkbox.checked) {
      doSubmit(title, description, null);
      return;
    }

    submitBtn.innerText = 'Capturing...';
    pendingTitle = title;
    pendingDescription = description;

    loadHtml2Canvas(() => {
      if (typeof window.html2canvas === 'undefined') { doSubmit(title, description, null); return; }
      widgetContainer.style.visibility = 'hidden';
      formContainer.style.display = 'none';
      window.html2canvas(document.body, { logging: false, useCORS: true, scale: 0.75 })
        .then(c => {
          widgetContainer.style.visibility = 'visible';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Submit Report';
          showAnnotation(c.toDataURL('image/jpeg', 0.8));
        })
        .catch(() => {
          widgetContainer.style.visibility = 'visible';
          formContainer.style.display = 'block';
          doSubmit(title, description, null);
        });
    });
  });

})();
