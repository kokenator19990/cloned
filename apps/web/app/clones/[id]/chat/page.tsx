'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStore, type CloneProfile, depthLabel, depthColor } from '@/lib/localStore';
import { TalkingAvatar } from '@/components/ui/TalkingAvatar';
import { ArrowLeft, Send, Volume2, VolumeX, Mic } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'clone';
    content: string;
    timestamp: Date;
    audioUrl?: string;
}

// Improved response matching using keyword overlap + category relevance
function generateResponse(clone: CloneProfile, userMessage: string): { text: string; audioUrl?: string } {
    const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const answers = clone.answers;

    if (answers.length === 0) {
        return { text: `Hola, soy ${clone.name}. Necesito más entrevistas para poder conversar mejor.` };
    }

    // Extract keywords (ignore short/common words)
    const stopwords = new Set(['que', 'como', 'cual', 'por', 'para', 'con', 'una', 'los', 'las', 'del', 'eres', 'haces', 'tiene', 'tiene', 'esta', 'ese', 'esa', 'esos', 'esas', 'hay', 'mas', 'pero']);
    const keywords = msg.split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w));

    let bestMatch: { score: number; qa: (typeof answers)[0] } | null = null;

    for (const qa of answers) {
        const combined = (qa.question + ' ' + qa.answer).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let score = 0;
        for (const kw of keywords) {
            if (combined.includes(kw)) score += 2;
        }
        // Bonus for category match
        if (msg.includes(qa.category.toLowerCase())) score += 3;

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { score, qa };
        }
    }

    if (bestMatch && bestMatch.score >= 2) {
        const connectors = ['', 'Mira, ', 'Te cuento, ', 'A ver... ', 'Pues, ', 'Sabes, ', 'Bueno, '];
        const c = connectors[Math.floor(Math.random() * connectors.length)];
        return { text: c + bestMatch.qa.answer, audioUrl: bestMatch.qa.audioUrl };
    }

    // Category-based fallback: try to match by category keywords
    const categoryKeywords: Record<string, string[]> = {
        personalidad: ['personalidad', 'caracter', 'persona', 'como eres', 'describir'],
        valores: ['valor', 'importante', 'principio', 'creer', 'moral'],
        recuerdos: ['recuerdo', 'memoria', 'pasado', 'cuando eras', 'infancia', 'momento'],
        humor: ['chiste', 'gracioso', 'reir', 'humor', 'divertido'],
        habitos: ['habito', 'rutina', 'dia', 'costumbre', 'hacer', 'manana'],
        opiniones: ['opinar', 'pensar', 'creer', 'opinion'],
        relaciones: ['relacion', 'amigo', 'familia', 'pareja', 'amor'],
        suenos: ['sueno', 'futuro', 'querer', 'desear', 'meta', 'plan'],
        filosofia: ['vida', 'sentido', 'muerte', 'existir', 'filosof'],
        gustos: ['favorito', 'gustar', 'preferir', 'comida', 'musica', 'pelicula'],
        identidad: ['identidad', 'quien', 'definir', 'nombre'],
    };

    for (const [cat, catKws] of Object.entries(categoryKeywords)) {
        if (catKws.some((kw) => msg.includes(kw))) {
            const catAnswers = answers.filter((a) => a.category === cat);
            if (catAnswers.length > 0) {
                const chosen = catAnswers[Math.floor(Math.random() * catAnswers.length)];
                return { text: chosen.answer, audioUrl: chosen.audioUrl };
            }
        }
    }

    // Random fallback with personality
    const randomQA = answers[Math.floor(Math.random() * answers.length)];
    const fallbacks = [
        `Mmm, buena pregunta. Algo que sí puedo decirte es: ${randomQA.answer}`,
        `Me hiciste pensar... cuando me preguntaron "${randomQA.question}", yo dije: "${randomQA.answer}"`,
        `No sé exactamente qué responderte, pero esto me viene a la mente: ${randomQA.answer}`,
        randomQA.answer,
    ];
    return {
        text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        audioUrl: randomQA.audioUrl,
    };
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const cloneId = params.id as string;
    const { loadClones, getClone } = useLocalStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const clone = getClone(cloneId);

    // Welcome
    useEffect(() => {
        if (clone && messages.length === 0) {
            const text = `¡Hola! Soy ${clone.name}. Tengo ${clone.answers.length} recuerdos${clone.voiceSamples > 0 ? ` y ${clone.voiceSamples} grabaciones de mi voz` : ''}. Pregúntame lo que quieras.`;
            const welcomeMsg: Message = {
                id: 'welcome',
                role: 'clone',
                content: text,
                timestamp: new Date(),
            };
            setMessages([welcomeMsg]);
            if (ttsEnabled) speakText(text);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clone]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
        audio.onerror = () => {
            setIsSpeaking(false);
            // Fallback to TTS
        };
        audio.play().catch(() => setIsSpeaking(false));
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !clone || isTyping) return;

        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        const userInput = input.trim();
        setInput('');
        setIsTyping(true);

        const delay = 600 + Math.random() * 1200;
        setTimeout(() => {
            const response = generateResponse(clone, userInput);
            const cloneMsg: Message = {
                id: crypto.randomUUID(),
                role: 'clone',
                content: response.text,
                timestamp: new Date(),
                audioUrl: response.audioUrl,
            };
            setMessages((prev) => [...prev, cloneMsg]);
            setIsTyping(false);

            // Speak: prefer original voice recording, fallback to TTS
            if (ttsEnabled) {
                if (response.audioUrl) {
                    playOriginalVoice(response.audioUrl);
                } else {
                    speakText(response.text);
                }
            }
        }, delay);
    };

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

                {/* Talking Avatar in header */}
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
                            {clone.voiceSamples > 0 && (
                                <span className="inline-flex items-center gap-0.5 ml-1 text-red-500">
                                    <Mic className="w-2.5 h-2.5" />{clone.voiceSamples}
                                </span>
                            )}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${depthColor(clone.depth)}`}>
                            {depthLabel(clone.depth)}
                        </span>
                    </div>
                </div>

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
                                {msg.role === 'clone' && msg.audioUrl && (
                                    <button
                                        onClick={() => playOriginalVoice(msg.audioUrl!)}
                                        className="mt-1 flex items-center gap-1 text-[11px] text-red-500/60 hover:text-red-500 transition-colors ml-1"
                                    >
                                        <Mic className="w-3 h-3" />
                                        Voz original grabada
                                    </button>
                                )}
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
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Escribe a ${clone.name}...`}
                        className="flex-1 px-4 py-3 bg-charcoal/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-[15px]"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-30 shadow-lg shadow-primary/20"
                    >
                        <Send className="w-4.5 h-4.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
