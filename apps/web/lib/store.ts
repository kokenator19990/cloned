import { create } from 'zustand';
import api from './api';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface Profile {
  id: string;
  name: string;
  relationship?: string;
  description?: string;
  status: 'ENROLLING' | 'ACTIVE' | 'ARCHIVED';
  currentInteractions: number;
  minInteractions: number;
  voiceConsentGiven: boolean;
  coverageMap: Record<string, { count: number; minRequired: number; covered: boolean }>;
  consistencyScore: number;
  avatarConfig?: {
    skin: string;
    mood: string;
    accessories: string[];
    baseImageKey: string | null;
  };
}

interface EnrollmentQuestion {
  id: string;
  category: string;
  question: string;
  turnNumber: number;
}

interface EnrollmentProgress {
  totalInteractions: number;
  minRequired: number;
  percentComplete: number;
  coverageMap: Record<string, { count: number; minRequired: number; covered: boolean }>;
  isReady: boolean;
}

interface ChatMessage {
  id: string;
  role: 'USER' | 'PERSONA' | 'SYSTEM';
  content: string;
  timestamp: string;
}

// ── Auth Store ──
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: true,
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cloned_token', data.accessToken);
    set({ token: data.accessToken, user: data.user });
  },
  register: async (email, password, displayName) => {
    const { data } = await api.post('/auth/register', { email, password, displayName });
    localStorage.setItem('cloned_token', data.accessToken);
    set({ token: data.accessToken, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('cloned_token');
    set({ token: null, user: null });
  },
  loadFromStorage: async () => {
    const token = localStorage.getItem('cloned_token');
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        set({ token, user: data, loading: false });
      } catch {
        localStorage.removeItem('cloned_token');
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },
}));

// ── Profile Store ──
interface ProfileState {
  profiles: Profile[];
  currentProfile: Profile | null;
  fetchProfiles: () => Promise<void>;
  createProfile: (name: string, relationship?: string, description?: string) => Promise<Profile>;
  fetchProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  activateProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  currentProfile: null,
  fetchProfiles: async () => {
    const { data } = await api.get('/profiles');
    set({ profiles: data });
  },
  createProfile: async (name, relationship, description) => {
    const { data } = await api.post('/profiles', { name, relationship, description });
    set((s) => ({ profiles: [data, ...s.profiles] }));
    return data;
  },
  fetchProfile: async (id) => {
    const { data } = await api.get(`/profiles/${id}`);
    set({ currentProfile: data });
  },
  deleteProfile: async (id) => {
    await api.delete(`/profiles/${id}`);
    set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }));
  },
  activateProfile: async (id) => {
    await api.post(`/profiles/${id}/activate`);
    set((s) => ({
      currentProfile: s.currentProfile ? { ...s.currentProfile, status: 'ACTIVE' } : null,
    }));
  },
}));

// ── Enrollment Store ──
interface EnrollmentState {
  currentQuestion: EnrollmentQuestion | null;
  progress: EnrollmentProgress | null;
  loading: boolean;
  fetchNextQuestion: (profileId: string) => Promise<void>;
  submitAnswer: (profileId: string, questionId: string, answer: string) => Promise<void>;
  fetchProgress: (profileId: string) => Promise<void>;
  startEnrollment: (profileId: string) => Promise<void>;
}

export const useEnrollmentStore = create<EnrollmentState>((set) => ({
  currentQuestion: null,
  progress: null,
  loading: false,
  startEnrollment: async (profileId) => {
    set({ loading: true });
    const { data } = await api.post(`/enrollment/${profileId}/start`);
    set({ currentQuestion: data, loading: false });
  },
  fetchNextQuestion: async (profileId) => {
    set({ loading: true });
    const { data } = await api.get(`/enrollment/${profileId}/next-question`);
    set({ currentQuestion: data, loading: false });
  },
  submitAnswer: async (profileId, questionId, answer) => {
    set({ loading: true });
    const { data } = await api.post(`/enrollment/${profileId}/answer`, { questionId, answer });
    set({ progress: data, loading: false });
  },
  fetchProgress: async (profileId) => {
    const { data } = await api.get(`/enrollment/${profileId}/progress`);
    set({ progress: data });
  },
}));

// ── Chat Store ──
interface ChatState {
  sessions: Array<{ id: string; startedAt: string; messageCount: number }>;
  currentSessionId: string | null;
  messages: ChatMessage[];
  streaming: boolean;
  streamText: string;
  createSession: (profileId: string) => Promise<string>;
  fetchSessions: (profileId: string) => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, content: string) => Promise<void>;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  streaming: false,
  streamText: '',
  createSession: async (profileId) => {
    const { data } = await api.post(`/chat/${profileId}/sessions`);
    set({ currentSessionId: data.id });
    return data.id;
  },
  fetchSessions: async (profileId) => {
    const { data } = await api.get(`/chat/${profileId}/sessions`);
    set({ sessions: data });
  },
  fetchMessages: async (sessionId) => {
    const { data } = await api.get(`/chat/sessions/${sessionId}/messages`);
    set({ messages: data, currentSessionId: sessionId });
  },
  sendMessage: async (sessionId, content) => {
    set({ streaming: true, streamText: '' });
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    // Try streaming via Socket.IO first
    try {
      const { getChatSocket } = await import('./socket');
      const socket = getChatSocket();

      if (socket.connected) {
        return new Promise<void>((resolve) => {
          let fullText = '';
          const streamingMsgId = `stream-${Date.now()}`;

          const onChunk = (data: { sessionId: string; chunk: string }) => {
            if (data.sessionId !== sessionId) return;
            fullText += data.chunk;
            set((s) => {
              const withoutStream = s.messages.filter((m) => m.id !== streamingMsgId);
              return {
                messages: [
                  ...withoutStream,
                  { id: streamingMsgId, role: 'PERSONA' as const, content: fullText, timestamp: new Date().toISOString() },
                ],
                streamText: fullText,
              };
            });
          };

          const onEnd = (data: { sessionId: string }) => {
            if (data.sessionId !== sessionId) return;
            socket.off('chat:stream', onChunk);
            socket.off('chat:end', onEnd);
            socket.off('chat:error', onError);
            set({ streaming: false, streamText: '' });
            resolve();
          };

          const onError = (data: { sessionId: string; error: string }) => {
            if (data.sessionId !== sessionId) return;
            socket.off('chat:stream', onChunk);
            socket.off('chat:end', onEnd);
            socket.off('chat:error', onError);
            set({ streaming: false, streamText: '' });
            resolve();
          };

          socket.on('chat:stream', onChunk);
          socket.on('chat:end', onEnd);
          socket.on('chat:error', onError);

          // Extract userId from token safely
          let userId = '';
          try {
            const token = localStorage.getItem('cloned_token');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.sub || '';
            }
          } catch {
            // Token parsing failed, userId remains empty
          }
          socket.emit('chat:send', { sessionId, content, userId });
        });
      }
    } catch {
      // Fall through to HTTP
    }

    // Fallback: HTTP POST
    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
      set((s) => ({
        messages: [
          ...s.messages.filter((m) => m.id !== userMsg.id),
          data.userMessage,
          data.personaMessage,
        ],
        streaming: false,
        streamText: '',
      }));
    } catch {
      set({ streaming: false });
    }
  },
  appendStreamChunk: (chunk) => set((s) => ({ streamText: s.streamText + chunk })),
  finalizeStream: () => set({ streaming: false, streamText: '' }),
}));

