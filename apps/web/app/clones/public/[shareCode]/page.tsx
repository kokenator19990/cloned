'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageCircle, User, Loader2, ArrowLeft, Send } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PublicProfile {
    id: string;
    name: string;
    relationship: string | null;
    description: string | null;
    status: string;
    shareCode: string;
}

interface Message {
    id: string;
    role: 'USER' | 'PERSONA';
    content: string;
    timestamp: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const shareCode = params.shareCode as string;

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Get or create guest token
    useEffect(() => {
        const stored = localStorage.getItem('cloned_token');
        if (stored) {
            setToken(stored);
        } else {
            // Auto-create guest session
            fetch(`${API}/auth/guest`, { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    localStorage.setItem('cloned_token', data.accessToken);
                    setToken(data.accessToken);
                })
                .catch(() => setError('No se pudo iniciar sesión de invitado'));
        }
    }, []);

    // Load public profile
    useEffect(() => {
        fetch(`${API}/profiles/public/${shareCode}`)
            .then(r => {
                if (!r.ok) throw new Error('Perfil no encontrado');
                return r.json();
            })
            .then(setProfile)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [shareCode]);

    // Start chat session when token + profile are ready
    useEffect(() => {
        if (!token || !profile) return;
        fetch(`${API}/chat/public/${shareCode}/sessions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setSessionId(data.id))
            .catch(() => setError('No se pudo iniciar la sesión de chat'));
    }, [token, profile, shareCode]);

    const sendMessage = async () => {
        if (!input.trim() || !sessionId || !token || sending) return;
        const content = input.trim();
        setInput('');
        setSending(true);

        // Optimistic user message
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, role: 'USER', content, timestamp: new Date().toISOString() }]);

        try {
            const res = await fetch(`${API}/chat/sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempId),
                data.userMessage,
                data.personaMessage,
            ]);

            // TTS via Web Speech API
            if (data.personaMessage?.content && 'speechSynthesis' in window) {
                const utt = new SpeechSynthesisUtterance(data.personaMessage.content);
                utt.lang = 'es-ES';
                window.speechSynthesis.speak(utt);
            }
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setError('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-light">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (error && !profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light gap-4">
            <p className="text-red-500">{error}</p>
            <button onClick={() => router.back()} className="text-primary underline">Volver</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-charcoal/5 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-charcoal/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-charcoal/50" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-[#6366f1]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="font-display font-semibold text-lg">{profile?.name}</h1>
                    {profile?.relationship && (
                        <p className="text-xs text-charcoal/40">{profile.relationship}</p>
                    )}
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-charcoal/40">
                    <MessageCircle className="w-4 h-4" />
                    Perfil público
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
                {messages.length === 0 && sessionId && (
                    <div className="text-center py-16 text-charcoal/30">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Empieza la conversación con <strong>{profile?.name}</strong></p>
                    </div>
                )}
                {!sessionId && !error && (
                    <div className="text-center py-16 text-charcoal/30">
                        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
                        <p>Conectando...</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'USER'
                                ? 'bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white rounded-br-sm'
                                : 'bg-white border border-charcoal/5 text-charcoal rounded-bl-sm shadow-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-charcoal/5 bg-white">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder={`Escríbele a ${profile?.name}...`}
                        disabled={!sessionId || sending}
                        className="flex-1 px-4 py-3 rounded-full border border-charcoal/10 bg-background-light text-sm outline-none focus:border-primary/40 transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || !sessionId || sending}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-center text-xs text-charcoal/30 mt-2">
                    🔊 Las respuestas se leen en voz alta automáticamente
                </p>
            </div>
        </div>
    );
}
