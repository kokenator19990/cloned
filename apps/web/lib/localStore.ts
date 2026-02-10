'use client';
import { create } from 'zustand';

// ── Types ──
export interface QA {
    question: string;
    answer: string;
    category: string;
    audioUrl?: string;
    isVoice?: boolean;
    depth?: 'basic' | 'deep' | 'expert';
}

export type ProfileDepth = 'basic' | 'deep' | 'expert' | 'master';

export interface CloneProfile {
    id: string;
    name: string;
    photoUrl: string | null;
    answers: QA[];
    createdAt: string;
    status: 'creating' | 'ready';
    voiceSamples: number;
    totalVoiceDuration: number; // seconds
    depth: ProfileDepth;
}

// Compute depth from answer count and voice %
export function computeDepth(answerCount: number, voiceCount: number): ProfileDepth {
    const voiceRatio = answerCount > 0 ? voiceCount / answerCount : 0;
    if (answerCount >= 200 && voiceRatio >= 0.5) return 'master';
    if (answerCount >= 100) return 'expert';
    if (answerCount >= 50) return 'deep';
    return 'basic';
}

export function depthLabel(depth: ProfileDepth): string {
    switch (depth) {
        case 'master': return 'Maestro';
        case 'expert': return 'Experto';
        case 'deep': return 'Profundo';
        case 'basic': return 'Básico';
    }
}

export function depthColor(depth: ProfileDepth): string {
    switch (depth) {
        case 'master': return 'text-amber-600 bg-amber-50';
        case 'expert': return 'text-purple-600 bg-purple-50';
        case 'deep': return 'text-blue-600 bg-blue-50';
        case 'basic': return 'text-charcoal/60 bg-charcoal/5';
    }
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
            voiceSamples: 0,
            totalVoiceDuration: 0,
            depth: 'basic',
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
        const updated = get().clones.map((c) => {
            if (c.id !== id) return c;
            const newAnswers = [...c.answers, qa];
            const newVoice = c.voiceSamples + (qa.isVoice ? 1 : 0);
            return {
                ...c,
                answers: newAnswers,
                voiceSamples: newVoice,
                depth: computeDepth(newAnswers.length, newVoice),
            };
        });
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
