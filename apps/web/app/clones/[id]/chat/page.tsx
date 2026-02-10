'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocalStore, type CloneProfile } from '@/lib/localStore';
import { ArrowLeft, Send, User } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'clone';
    content: string;
    timestamp: Date;
}

// Simple response generator based on stored Q&A answers
function generateResponse(clone: CloneProfile, userMessage: string): string {
    const msg = userMessage.toLowerCase();
    const answers = clone.answers;

    if (answers.length === 0) {
        return `Hola, soy ${clone.name}. Aún no tengo mucha información para conversar. ¡Intenta hacerme preguntas!`;
    }

    // Try to find a relevant answer based on keyword matching
    const keywords = msg.split(/\s+/).filter((w) => w.length > 3);
    let bestMatch: { score: number; answer: string } | null = null;

    for (const qa of answers) {
        const combined = (qa.question + ' ' + qa.answer).toLowerCase();
        let score = 0;
        for (const kw of keywords) {
            if (combined.includes(kw)) score++;
        }
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { score, answer: qa.answer };
        }
    }

    if (bestMatch && bestMatch.score >= 1) {
        // Add some personality variation
        const prefixes = [
            '', 'Mira, ', 'Te cuento, ', 'A ver... ', 'Buena pregunta. ',
            'Hmm, ', 'Pues, ', 'Sabes qué, ', 'Déjame pensar... ',
        ];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + bestMatch.answer;
    }

    // Fallback: random answer from stored data
    const randomQA = answers[Math.floor(Math.random() * answers.length)];
    const fallbacks = [
        `No estoy seguro de eso, pero te cuento algo: ${randomQA.answer}`,
        `Mmm, no sé bien qué decirte sobre eso. Pero algo que sí sé es que ${randomQA.answer.toLowerCase()}`,
        `Interesante pregunta. Yo más bien pienso en cosas como: ${randomQA.answer}`,
        `No tengo una respuesta exacta, pero me recuerda a cuando me preguntaron "${randomQA.question}" y respondí: "${randomQA.answer}"`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const cloneId = params.id as string;
    const { loadClones, getClone } = useLocalStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const clone = getClone(cloneId);

    // Welcome message
    useEffect(() => {
        if (clone && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'clone',
                    content: `¡Hola! Soy ${clone.name}. Pregúntame lo que quieras, voy a responder con todo lo que sé de mí.`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [clone, messages.length]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !clone) return;

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

        // Simulate typing delay
        const delay = 800 + Math.random() * 1200;
        setTimeout(() => {
            const response = generateResponse(clone, userInput);
            const cloneMsg: Message = {
                id: crypto.randomUUID(),
                role: 'clone',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, cloneMsg]);
            setIsTyping(false);
        }, delay);
    };

    if (!clone) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <p className="text-charcoal/60">
                    Clon no encontrado.{' '}
                    <button onClick={() => router.push('/clones')} className="text-primary underline">
                        Ver mis clones
                    </button>
                </p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background-light text-charcoal font-body flex flex-col">
            {/* Chat Header */}
            <div className="px-4 py-4 flex items-center gap-4 border-b border-charcoal/5 bg-white/80 backdrop-blur-md">
                <Link href="/clones" className="p-2 -m-2 rounded-full hover:bg-charcoal/5 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-charcoal/5 flex-shrink-0">
                    {clone.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={clone.photoUrl} alt={clone.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-charcoal/30" />
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="font-display font-medium text-lg leading-tight">Hablando con {clone.name}</h2>
                    <p className="text-xs text-charcoal/40">{clone.answers.length} recuerdos</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white rounded-br-md'
                                    : 'bg-white border border-charcoal/5 text-charcoal rounded-bl-md shadow-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-charcoal/5 px-5 py-3 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="px-4 py-4 border-t border-charcoal/5 bg-white/80 backdrop-blur-md"
            >
                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Escribe a ${clone.name}...`}
                        className="flex-1 px-5 py-3.5 bg-charcoal/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-[15px]"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-40 shadow-lg shadow-primary/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
