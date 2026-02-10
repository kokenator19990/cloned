// ── Chat with LLM Backend (Ollama) ──
'use client';
import { useState, useCallback } from 'react';
import api, { ensureAuth } from './api-client';

interface Message {
  id: string;
  role: 'user' | 'clone';
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  profileId: string;
  onResponse?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useBackendChat({ profileId, onResponse, onError }: UseChatOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Create or resume session
  const initSession = useCallback(async () => {
    try {
      await ensureAuth();
      const { data } = await api.post(`/chat/${profileId}/sessions`);
      setSessionId(data.id);
      
      // Load existing messages if any
      const { data: msgs } = await api.get(`/chat/sessions/${data.id}/messages`);
      const formatted = msgs.map((m: any) => ({
        id: m.id,
        role: m.role === 'USER' ? 'user' : 'clone',
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(formatted);
      
      return data.id;
    } catch (error: any) {
      console.error('Failed to init session:', error);
      onError?.(error);
      return null;
    }
  }, [profileId, onError]);

  // Send message with LLM reasoning
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Ensure session exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await initSession();
      if (!currentSessionId) return;
    }

    // Add user message immediately
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      await ensureAuth();
      
      // Call backend - it will use Ollama to generate cognitive response
      const { data } = await api.post(`/chat/sessions/${currentSessionId}/messages`, {
        content,
        voiceUsed: false,
      });

      // Add clone response
      const cloneMsg: Message = {
        id: data.personaMessage.id,
        role: 'clone',
        content: data.personaMessage.content,
        timestamp: new Date(data.personaMessage.timestamp),
      };
      
      setMessages((prev) => [...prev, cloneMsg]);
      onResponse?.(cloneMsg);
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      onError?.(error);
      
      // Fallback error message
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'clone',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, initSession, onResponse, onError]);

  return {
    messages,
    isTyping,
    sendMessage,
    initSession,
  };
}

/**
 * Generate audio with cloned voice (future)
 */
export async function generateClonedVoice(text: string, profileId: string): Promise<string | null> {
  try {
    await ensureAuth();
    const { data } = await api.post('/voice/tts', {
      text,
      profileId,
    });
    
    // Return base64 audio
    return `data:audio/wav;base64,${data.audio}`;
  } catch (error) {
    console.error('Failed to generate voice:', error);
    return null;
  }
}
