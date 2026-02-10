'use client';
import { create } from 'zustand';

// ── Types ──
export interface QA {
    question: string;
    answer: string;
    category: string;
}

export interface CloneProfile {
    id: string;
    name: string;
    photoUrl: string | null;
    answers: QA[];
    createdAt: string;
    status: 'creating' | 'ready';
}

interface LocalState {
    clones: CloneProfile[];
    loadClones: () => void;
    createClone: (name: string) => CloneProfile;
    updateClonePhoto: (id: string, photoUrl: string) => void;
    addAnswer: (id: string, qa: QA) => void;
    finalizeClone: (id: string) => void;
    deleteClone: (id: string) => void;
    getClone: (id: string) => CloneProfile | undefined;
}

const STORAGE_KEY = 'cloned_profiles';

function persist(clones: CloneProfile[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clones));
    }
}

function load(): CloneProfile[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export const useLocalStore = create<LocalState>((set, get) => ({
    clones: [],

    loadClones: () => {
        set({ clones: load() });
    },

    createClone: (name: string) => {
        const clone: CloneProfile = {
            id: crypto.randomUUID(),
            name,
            photoUrl: null,
            answers: [],
            createdAt: new Date().toISOString(),
            status: 'creating',
        };
        const updated = [...get().clones, clone];
        set({ clones: updated });
        persist(updated);
        return clone;
    },

    updateClonePhoto: (id: string, photoUrl: string) => {
        const updated = get().clones.map((c) =>
            c.id === id ? { ...c, photoUrl } : c,
        );
        set({ clones: updated });
        persist(updated);
    },

    addAnswer: (id: string, qa: QA) => {
        const updated = get().clones.map((c) =>
            c.id === id ? { ...c, answers: [...c.answers, qa] } : c,
        );
        set({ clones: updated });
        persist(updated);
    },

    finalizeClone: (id: string) => {
        const updated = get().clones.map((c) =>
            c.id === id ? { ...c, status: 'ready' as const } : c,
        );
        set({ clones: updated });
        persist(updated);
    },

    deleteClone: (id: string) => {
        const updated = get().clones.filter((c) => c.id !== id);
        set({ clones: updated });
        persist(updated);
    },

    getClone: (id: string) => {
        return get().clones.find((c) => c.id === id);
    },
}));
