'use client';
import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalStore, depthLabel, depthColor } from '@/lib/localStore';
import { QUESTIONS, MIN_QUESTIONS } from '@/lib/questions';
import { CheckCircle2, Sparkles, ChevronRight, Mic, Square, Keyboard, Volume2, RotateCcw } from 'lucide-react';


function QuestionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cloneId = searchParams.get('id');
    const { loadClones, getClone, addAnswer, finalizeClone } = useLocalStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

    // Voice recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sttRef = useRef<any>(null);

    // Shuffle questions by depth — basic first, then deep, then expert
    const shuffled = useMemo(() => {
        const byDepth = { basic: [] as typeof QUESTIONS, deep: [] as typeof QUESTIONS, expert: [] as typeof QUESTIONS };
        QUESTIONS.forEach((q) => byDepth[q.depth].push(q));
        // Shuffle within each depth
        const shuffle = (arr: typeof QUESTIONS) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };
        return [...shuffle(byDepth.basic), ...shuffle(byDepth.deep), ...shuffle(byDepth.expert)];
    }, []);

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const clone = cloneId ? getClone(cloneId) : undefined;

    useEffect(() => {
        if (clone) setAnsweredCount(clone.answers.length);
    }, [clone]);

    // Cleanup
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            if (timerRef.current) clearInterval(timerRef.current);
            try { sttRef.current?.stop(); } catch { }
        };
    }, []);

    const currentQuestion = shuffled[currentIndex];
    const canFinalize = answeredCount >= MIN_QUESTIONS;
    const progress = Math.min((answeredCount / MIN_QUESTIONS) * 100, 100);

    // ── TTS: Read question aloud ──
    const speakQuestion = useCallback((text: string) => {
        if (typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
        if (spanishVoice) utterance.voice = spanishVoice;
        utterance.onend = () => setHasSpoken(true);
        window.speechSynthesis.speak(utterance);
    }, []);

    // Auto-speak each new question
    useEffect(() => {
        if (currentQuestion && inputMode === 'voice') {
            setHasSpoken(false);
            // Small delay so the UI settles
            const t = setTimeout(() => speakQuestion(currentQuestion.text), 600);
            return () => clearTimeout(t);
        }
    }, [currentIndex, currentQuestion, inputMode, speakQuestion]);

    // ── Voice Recording ──
    const startRecording = async () => {
        try {
            window.speechSynthesis.cancel(); // Stop any TTS
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = () => setAudioUrl(reader.result as string);
                reader.readAsDataURL(blob);
                stream.getTracks().forEach((t) => t.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAudioUrl(null);
            setAnswer('');

            timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);

            // Start live STT
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
                    setAnswer(transcript);
                    setIsTranscribing(false);
                };
                recognition.onerror = () => { };
                sttRef.current = recognition;
                recognition.start();
            }
        } catch {
            alert('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setIsTranscribing(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        try { sttRef.current?.stop(); } catch { }
        // Give STT a moment to finalize
        setTimeout(() => setIsTranscribing(false), 1500);
    };

    const handleSubmit = useCallback(() => {
        if (!answer.trim() || !cloneId || !currentQuestion) return;
        addAnswer(cloneId, {
            question: currentQuestion.text,
            answer: answer.trim(),
            category: currentQuestion.category,
            audioUrl: audioUrl || undefined,
            isVoice: inputMode === 'voice' && !!audioUrl,
            depth: currentQuestion.depth,
        });
        setAnswer('');
        setAudioUrl(null);
        setHasSpoken(false);
        setAnsweredCount((c) => c + 1);
        setCurrentIndex((i) => i + 1);
    }, [answer, cloneId, currentQuestion, addAnswer, audioUrl, inputMode]);

    const handleSkip = () => {
        setAnswer('');
        setAudioUrl(null);
        setHasSpoken(false);
        window.speechSynthesis.cancel();
        setCurrentIndex((i) => i + 1);
    };

    const handleFinalize = () => {
        if (!cloneId) return;
        setIsFinishing(true);
        window.speechSynthesis.cancel();
        finalizeClone(cloneId);
        setTimeout(() => router.push('/clones'), 1500);
    };

    const resetRecording = () => {
        setAudioUrl(null);
        setAnswer('');
    };

    const formatTime = (s: number) =>
        `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Depth label for current question progression
    const depthPhase = answeredCount < 25 ? 'Conocerte' : answeredCount < 100 ? 'Profundizar' : 'Tu esencia';

    if (!cloneId || (!clone && answeredCount === 0)) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <p className="text-charcoal/60">
                    Clon no encontrado.{' '}
                    <button onClick={() => router.push('/create')} className="text-primary underline">Crear uno nuevo</button>
                </p>
            </div>
        );
    }

    if (isFinishing) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-[#6366f1]/20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-[#6366f1]/30 flex items-center justify-center animate-pulse">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-display font-medium text-center">
                    Perfil de <span className="italic text-primary/80">{clone?.name}</span> creado
                </h2>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-charcoal/60 text-center text-lg">
                        {answeredCount} respuestas · {clone?.voiceSamples || 0} con tu voz
                    </p>
                    {clone && (
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${depthColor(clone.depth)}`}>
                            Perfil {depthLabel(clone.depth)}
                        </span>
                    )}
                </div>
                <p className="text-charcoal/40 text-sm text-center animate-pulse">Redirigiendo...</p>
            </div>
        );
    }

    if (currentIndex >= shuffled.length) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 px-6">
                <h2 className="text-3xl font-display font-medium text-center">
                    ¡Has respondido todas las preguntas!
                </h2>
                <button
                    onClick={handleFinalize}
                    className="bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl flex items-center gap-3"
                >
                    Crear Perfil de {clone?.name}
                    <Sparkles className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light text-charcoal font-body flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-charcoal/5 bg-white/60 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="text-xl font-display font-semibold tracking-tight italic">Cloned</div>
                    <span className="text-xs text-charcoal/30">·</span>
                    <span className="text-xs text-charcoal/40 font-medium">{depthPhase}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            setInputMode(inputMode === 'voice' ? 'text' : 'voice');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${inputMode === 'voice'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-charcoal/5 text-charcoal/50'
                            }`}
                    >
                        {inputMode === 'voice' ? (
                            <><Mic className="w-3.5 h-3.5" /> Voz</>
                        ) : (
                            <><Keyboard className="w-3.5 h-3.5" /> Texto</>
                        )}
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="px-6 py-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-charcoal/60">
                        <span className="font-bold text-charcoal">{answeredCount}</span> / {MIN_QUESTIONS} mínimo
                    </span>
                    <div className="flex items-center gap-3">
                        {(clone?.voiceSamples || 0) > 0 && (
                            <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                                <Mic className="w-3 h-3" /> {clone?.voiceSamples} voz
                            </span>
                        )}
                        {canFinalize && (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {depthLabel(clone?.depth || 'basic')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-charcoal/30 uppercase tracking-widest">
                        {currentQuestion?.category} · {currentQuestion?.depth === 'basic' ? '🟢' : currentQuestion?.depth === 'deep' ? '🟡' : '🔴'}
                    </span>
                </div>
            </div>

            {/* Question + Answer Area */}
            <div className="flex-1 flex flex-col px-6 py-4 max-w-lg mx-auto w-full">
                <div className="flex-1 flex flex-col justify-center">
                    {/* Question number */}
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary/70 mb-3">
                        Pregunta {answeredCount + 1}
                    </p>

                    {/* The Question */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-display font-medium leading-snug">
                            {currentQuestion?.text}
                        </h2>
                        {inputMode === 'voice' && (
                            <button
                                onClick={() => currentQuestion && speakQuestion(currentQuestion.text)}
                                className="mt-2 flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary transition-colors"
                            >
                                <Volume2 className="w-3.5 h-3.5" /> Escuchar pregunta
                            </button>
                        )}
                    </div>

                    {inputMode === 'voice' ? (
                        /* ═══ Voice Mode ═══ */
                        <div className="flex flex-col items-center gap-5">
                            {/* Not recording, no audio yet */}
                            {!isRecording && !audioUrl && (
                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={startRecording}
                                        className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-500/30 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Mic className="w-10 h-10" />
                                        {/* Pulse ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-avatar-ring-1" />
                                    </button>
                                    <p className="text-sm text-charcoal/40 text-center">
                                        Presiona el micrófono y responde con tu voz
                                    </p>
                                </div>
                            )}

                            {/* Recording in progress */}
                            {isRecording && (
                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={stopRecording}
                                        className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-95 transition-all"
                                        style={{ animation: 'avatar-breathe 1s ease-in-out infinite' }}
                                    >
                                        <Square className="w-8 h-8" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-600 font-mono font-bold text-lg">{formatTime(recordingTime)}</span>
                                    </div>
                                    {/* Waveform */}
                                    <div className="flex items-end gap-[3px] h-8">
                                        {[...Array(16)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-red-400 rounded-full animate-wave-bar"
                                                style={{
                                                    animationDelay: `${i * 0.04}s`,
                                                    animationDuration: `${0.4 + Math.random() * 0.4}s`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {/* Live transcription preview */}
                                    {answer && (
                                        <p className="text-sm text-charcoal/50 text-center italic max-w-xs">
                                            &ldquo;{answer}&rdquo;
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Recording done */}
                            {audioUrl && !isRecording && (
                                <div className="w-full space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-200/30 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <Mic className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-charcoal/40 font-medium uppercase tracking-widest mb-1">Tu voz grabada</p>
                                            <audio src={audioUrl} controls className="w-full h-8" />
                                        </div>
                                    </div>

                                    {isTranscribing && (
                                        <p className="text-sm text-charcoal/40 text-center animate-pulse">Transcribiendo tu voz...</p>
                                    )}

                                    {/* Transcription */}
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Transcripción (puedes editar si es necesario)..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-charcoal/10 rounded-xl focus:border-primary/50 focus:outline-none transition-colors bg-white/50 resize-none text-sm"
                                    />

                                    <button onClick={resetRecording} className="flex items-center gap-1.5 text-xs text-charcoal/40 hover:text-charcoal/60">
                                        <RotateCcw className="w-3 h-3" /> Grabar de nuevo
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ═══ Text Mode ═══ */
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows={4}
                            autoFocus
                            className="w-full px-5 py-4 border-2 border-charcoal/10 rounded-2xl focus:border-primary/50 focus:outline-none transition-colors bg-white resize-none text-base"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSkip}
                        className="px-6 py-3.5 rounded-full text-charcoal/40 font-medium hover:bg-charcoal/5 transition-colors text-sm"
                    >
                        Saltar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        className="flex-1 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-6 py-3.5 rounded-full font-medium shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:hover:scale-100"
                    >
                        Siguiente
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Finalize */}
                {canFinalize && (
                    <button
                        onClick={handleFinalize}
                        className="mt-3 w-full py-3.5 rounded-full bg-green-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Crear Perfil ({answeredCount} respuestas · {clone?.voiceSamples || 0} voz)
                    </button>
                )}
            </div>
        </div>
    );
}

export default function QuestionsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background-light flex items-center justify-center"><p className="text-charcoal/50">Cargando...</p></div>}>
            <QuestionsContent />
        </Suspense>
    );
}

