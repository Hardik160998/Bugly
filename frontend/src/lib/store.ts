import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name: string;
    plan: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null, token: string | null) => void;
    logout: () => void;
    rehydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setUser: (user, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token ?? '');
            localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user, token });
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        set({ user: null, token: null });
    },
    rehydrate: () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token');
        const raw = localStorage.getItem('user');
        if (token && raw) {
            try { set({ token, user: JSON.parse(raw) }); } catch {}
        }
    },
}));

// --- Theme store ---
interface ThemeState {
  dark: boolean;
  toggle: () => void;
  rehydrateTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  dark: false,
  rehydrateTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('bugly_theme');
    const dark = stored === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    set({ dark });
  },
  toggle: () => {
    const next = !get().dark;
    localStorage.setItem('bugly_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
    set({ dark: next });
  },
}));

const STORAGE_KEY = 'bugly_seen_notif_ids';

function loadSeenIds(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
}

function saveSeenIds(ids: Set<string>) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

interface NotifState {
    seenIds: Set<string>;
    rehydrateNotifs: () => void;
    markSeen: (id: string) => void;
    markAllSeen: (ids: string[]) => void;
}

export const useNotifStore = create<NotifState>((set, get) => ({
    seenIds: new Set(),
    rehydrateNotifs: () => {
        if (typeof window === 'undefined') return;
        set({ seenIds: loadSeenIds() });
    },
    markSeen: (id) => {
        const next = new Set(get().seenIds).add(id);
        saveSeenIds(next);
        set({ seenIds: next });
    },
    markAllSeen: (ids) => {
        const next = new Set([...get().seenIds, ...ids]);
        saveSeenIds(next);
        set({ seenIds: next });
    },
}));
