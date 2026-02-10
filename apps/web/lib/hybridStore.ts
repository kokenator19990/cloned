// ── Hybrid Store: Backend + Local Fallback ──
'use client';
import { create } from 'zustand';
import api, { ensureAuth } from './api-client';
import { useLocalStore, type CloneProfile, type QA } from './localStore';

interface BackendProfile {
  id: string;
  name: string;
  relationship?: string;
  description?: string;
  status: 'ENROLLING' | 'ACTIVE' | 'ARCHIVED';
  currentInteractions: number;
  avatarConfig?: any;
}

interface HybridState {
  useBackend: boolean;
  profiles: BackendProfile[];
  loading: boolean;
  error: string | null;
  
  // Profile operations
  fetchProfiles: () => Promise<void>;
  createProfile: (name: string, relationship?: string) => Promise<BackendProfile>;
  getProfile: (id: string) => Promise<BackendProfile | null>;
  activateProfile: (id: string) => Promise<void>;
  
  // Enrollment operations
  submitAnswer: (profileId: string, question: string, answer: string, category: string, audioBlob?: Blob) => Promise<void>;
  getProgress: (profileId: string) => Promise<any>;
}

export const useHybridStore = create<HybridState>((set, get) => ({
  useBackend: true, // Toggle this to switch between backend and local
  profiles: [],
  loading: false,
  error: null,

  fetchProfiles: async () => {
    try {
      set({ loading: true, error: null });
      await ensureAuth();
      const { data } = await api.get('/profiles');
      set({ profiles: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Failed to fetch profiles:', error);
    }
  },

  createProfile: async (name: string, relationship?: string) => {
    try {
      await ensureAuth();
      const { data } = await api.post('/profiles', {
        name,
        relationship: relationship || 'self',
        description: `Clon digital de ${name}`,
      });
      set((s) => ({ profiles: [data, ...s.profiles] }));
      return data;
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  },

  getProfile: async (id: string) => {
    try {
      await ensureAuth();
      const { data } = await api.get(`/profiles/${id}`);
      return data;
    } catch (error: any) {
      console.error('Failed to get profile:', error);
      return null;
    }
  },

  activateProfile: async (id: string) => {
    try {
      await ensureAuth();
      await api.post(`/profiles/${id}/activate`);
      set((s) => ({
        profiles: s.profiles.map((p) => 
          p.id === id ? { ...p, status: 'ACTIVE' as const } : p
        ),
      }));
    } catch (error: any) {
      console.error('Failed to activate profile:', error);
      throw error;
    }
  },

  submitAnswer: async (profileId: string, question: string, answer: string, category: string, audioBlob?: Blob) => {
    try {
      await ensureAuth();
      
      // Submit text answer
      await api.post(`/enrollment/${profileId}/answer`, {
        question,
        answer,
        category,
      });

      // Upload audio if provided
      if (audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-sample.webm');
        await api.post(`/voice/${profileId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  },

  getProgress: async (profileId: string) => {
    try {
      await ensureAuth();
      const { data } = await api.get(`/enrollment/${profileId}/progress`);
      return data;
    } catch (error: any) {
      console.error('Failed to get progress:', error);
      return null;
    }
  },
}));

/**
 * Hook that automatically chooses backend or local based on availability
 */
export function useSmartStore() {
  const hybrid = useHybridStore();
  const local = useLocalStore();

  // For now, use local until we fully migrate
  // Later we can check if backend is available and switch
  return local;
}
