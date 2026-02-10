'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStore, type CloneProfile, depthLabel, depthColor } from '@/lib/localStore';
import { useBackendChat } from '@/lib/useBackendChat';
import { generateCognitiveResponse } from '@/lib/chat';
import { TalkingAvatar } from '@/components/ui/TalkingAvatar';
import { ArrowLeft, Send, Volume2, VolumeX, Mic, Plus, Square, Zap } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'clone';
    content: string;
    timestamp: Date;
    audioUrl?: string;
}

export default function ChatPageHybrid() {
    const params = useParams();
    const router = useRouter();
    const cloneId = params.id as string;
    const { loadClones, getClone } = useLocalStore();

    // Mode toggle: 'local' or 'llm' (Ollama)
    const [mode, setMode] = useState<'local' | 'llm'>('llm');
    
    // Local mode state
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [localTyping, setLocalTyping] = useState(false);
    
    // LLM mode state
    const { 
        messages: llmMessages, 
        isTyping: llmTyping, 
        sendMessage: sendLLMMessage,
        initSession 
    } = useBackendChat({
        profileId: cloneId,
        onError: (error) => {
            console.error('Backend chat error:', error);
            // Fallback to local mode
            setMode('local');
        },
    });

    // Shared state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sttRef = useRef<any>(null);

    const messages = mode === 'llm' ? llmMessages : localMessages;
    const input = mode === 'llm' ? localInput : localInput;
    const isTyping = mode === 'llm' ? llmTyping : localTyping;

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const clone = getClone(cloneId);

    // Initialize LLM session
    useEffect(() => {
        if (mode === 'llm' && clone) {
            initSession();
        }
    }, [mode, clone, initSession]);

    // Welcome
    useEffect(() => {
        if (clone && mode === 'local' && localMessages.length === 0) {
            const text = `¡Hola! Soy ${clone.name}. Tengo ${clone.answers.length} recuerdos${clone.voiceSamples > 0 ? ` y ${clone.voiceSamples} grabaciones de mi voz` : ''}. Pregúntame lo que quieras.`;
            const welcomeMsg: Message = {
                id: 'welcome',
                role: 'clone',
                content: text,
                timestamp: new Date(),
            };
            setLocalMessages([welcomeMsg]);
            if (ttsEnabled) speakText(text);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clone, mode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            audioRef.current?.pause();
            streamRef.current?.getTracks().forEach((t) => t.stop());
            try { sttRef.current?.stop(); } catch { }
        };
    }, []);

    // TTS
    const speakText = (text: string) => {
        if (!ttsEnabled || typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
        if (spanishVoice) utterance.voice = spanishVoice;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // Play original recording
    const playOriginalVoice = (audioUrl: string) => {
        setIsSpeaking(true);
        window.speechSynthesis.cancel();
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        audio.play().catch(() => setIsSpeaking(false));
    };

    // Voice recording for input
    const startVoiceInput = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            setIsRecording(true);
            setLocalInput('');

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.interimResults = true;
                recognition.continuous = true;
                recognition.onresult = (event: any) => {
                    let transcript = '';
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    setLocalInput(transcript);
                };
                recognition.onerror = () => { };
                sttRef.current = recognition;
                recognition.start();
            }
        } catch {
            alert('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    };

    const stopVoiceInput = () => {
        setIsRecording(false);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        try { sttRef.current?.stop(); } catch { }
    };

    const handleSendLocal = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!localInput.trim() || !clone || localTyping) return;

        if (isRecording) stopVoiceInput();

        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: localInput.trim(),
            timestamp: new Date(),
        };
        setLocalMessages((prev) => [...prev, userMsg]);
        const userInput = localInput.trim();
        setLocalInput('');
        setLocalTyping(true);

        const delay = 600 + Math.random() * 1200;
        setTimeout(() => {
            const response = generateCognitiveResponse({
                userMessage: userInput,
                answers: clone.answers,
                cloneName: clone.name,
            });
            
            const cloneMsg: Message = {
                id: crypto.randomUUID(),
                role: 'clone',
                content: response.text,
                timestamp: new Date(),
                audioUrl: response.audioUrl,
            };
            setLocalMessages((prev) => [...prev, cloneMsg]);
            setLocalTyping(false);

            if (ttsEnabled) {
                if (response.audioUrl) {
                    playOriginalVoice(response.audioUrl);
                } else {
                    speakText(response.text);
                }
            }
        }, delay);
    };

    const handleSendLLM = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!localInput.trim()) return;

        if (isRecording) stopVoiceInput();
        
        const msg = localInput.trim();
        setLocalInput('');
        
        await sendLLMMessage(msg);
        
        // Get last message for TTS
        if (ttsEnabled && llmMessages.length > 0) {
            const lastMsg = llmMessages[llmMessages.length - 1];
            if (lastMsg.role === 'clone') {
                speakText(lastMsg.content);
            }
        }
    };

    const handleSend = mode === 'llm' ? handleSendLLM : handleSendLocal;

    if (!clone) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <p className="text-charcoal/60">
                    Clon no encontrado.{' '}
                    <button onClick={() => router.push('/clones')} className="text-primary underline">Ver mis clones</button>
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background-light text-charcoal font-body flex flex-col">
            {/* ── Chat Header with Avatar ── */}
            <div className="px-4 py-3 flex items-center gap-4 border-b border-charcoal/5 bg-white/90 backdrop-blur-md">
                <Link href="/clones" className="p-2 -m-2 rounded-full hover:bg-charcoal/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-charcoal/60" />
                </Link>

                <TalkingAvatar
                    photoUrl={clone.photoUrl}
                    name={clone.name}
                    isSpeaking={isSpeaking}
                    size="sm"
                />

                <div className="flex-1 min-w-0">
                    <h2 className="font-display font-medium text-base leading-tight truncate">
                        Hablando con {clone.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-charcoal/40">
                            {clone.answers.length} interacciones
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${depthColor(clone.depth)}`}>
                            {depthLabel(clone.depth)}
                        </span>
                        {mode === 'llm' && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                LLM
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mode toggle */}
                    <button
                        onClick={() => setMode(m => m === 'local' ? 'llm' : 'local')}
                        className={`p-2 rounded-full transition-colors ${
                            mode === 'llm' ? 'bg-purple-100 text-purple-600' : 'bg-charcoal/5 text-charcoal/50'
                        }`}
                        title={mode === 'llm' ? 'Usando Ollama LLM' : 'Modo local simple'}
                    >
                        <Zap className="w-4 h-4" />
                    </button>
                    
                    <Link
                        href={`/create/questions?id=${cloneId}`}
                        className="p-2 rounded-full transition-colors bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/60"
                        title="Responder más preguntas"
                    >
                        <Plus className="w-5 h-5" />
                    </Link>
                    
                    <button
                        onClick={() => {
                            const newVal = !ttsEnabled;
                            setTtsEnabled(newVal);
                            if (!newVal) {
                                window.speechSynthesis.cancel();
                                audioRef.current?.pause();
                                setIsSpeaking(false);
                            }
                        }}
                        className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'bg-primary/10 text-primary' : 'bg-charcoal/5 text-charcoal/30'
                            }`}
                    >
                        {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ── Selfie-Mode Avatar (large, when speaking) ── */}
            {isSpeaking && (
                <div className="flex justify-center py-4 bg-gradient-to-b from-primary/3 to-transparent">
                    <TalkingAvatar
                        photoUrl={clone.photoUrl}
                        name={clone.name}
                        isSpeaking={true}
                        size="lg"
                    />
                </div>
            )}

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${msg.role === 'clone' ? 'flex gap-2.5' : ''}`}>
                            {msg.role === 'clone' && (
                                <TalkingAvatar
                                    photoUrl={clone.photoUrl}
                                    name={clone.name}
                                    isSpeaking={isSpeaking && messages[messages.length - 1]?.id === msg.id}
                                    size="sm"
                                />
                            )}
                            <div>
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white rounded-br-md'
                                            : 'bg-white border border-charcoal/5 text-charcoal rounded-bl-md shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === 'clone' && (msg as any).audioUrl ? (
                                    <button
                                        onClick={() => playOriginalVoice((msg as any).audioUrl)}
                                        className="mt-1 flex items-center gap-1 text-[11px] text-red-500/60 hover:text-red-500 transition-colors ml-1"
                                    >
                                        <Mic className="w-3 h-3" />
                                        Voz original grabada
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-2.5">
                            <TalkingAvatar photoUrl={clone.photoUrl} name={clone.name} isSpeaking={false} size="sm" />
                            <div className="bg-white border border-charcoal/5 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-charcoal/5 bg-white/90 backdrop-blur-md">
                <div className="flex items-center gap-2.5 max-w-2xl mx-auto">
                    {inputMode === 'voice' && !isRecording ? (
                        <button
                            type="button"
                            onClick={startVoiceInput}
                            className="flex-1 px-4 py-3 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-500/20 transition-colors"
                        >
                            <Mic className="w-5 h-5" />
                            Presiona para hablar
                        </button>
                    ) : isRecording ? (
                        <div className="flex-1 px-4 py-3 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center gap-3">
                            <button
                                type="button"
                                onClick={stopVoiceInput}
                                className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse"
                            >
                                <Square className="w-4 h-4 text-white" />
                            </button>
                            <span className="flex-1 text-sm text-charcoal/70 italic">
                                {localInput || 'Escuchando...'}
                            </span>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder={`Escribe a ${clone.name}...`}
                            className="flex-1 px-4 py-3 bg-charcoal/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-[15px]"
                            autoFocus
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (isRecording) stopVoiceInput();
                            setInputMode(inputMode === 'voice' ? 'text' : 'voice');
                        }}
                        className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
                            inputMode === 'voice' ? 'bg-red-500/10 text-red-600' : 'bg-charcoal/5 text-charcoal/50'
                        }`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={!localInput.trim() || isTyping}
                        className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-30 shadow-lg shadow-primary/20"
                    >
                        <Send className="w-4.5 h-4.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
