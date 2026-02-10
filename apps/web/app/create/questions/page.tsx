'use client';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalStore } from '@/lib/localStore';
import { QUESTIONS, MIN_QUESTIONS } from '@/lib/questions';
import { CheckCircle2, Sparkles, ChevronRight, Mic, Square, Keyboard } from 'lucide-react';

export default function QuestionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cloneId = searchParams.get('id');
    const { loadClones, getClone, addAnswer, finalizeClone } = useLocalStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Shuffle questions once
    const shuffled = useMemo(() => {
        const arr = [...QUESTIONS];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, []);

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const clone = cloneId ? getClone(cloneId) : undefined;

    useEffect(() => {
        if (clone) {
            setAnsweredCount(clone.answers.length);
        }
    }, [clone]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const currentQuestion = shuffled[currentIndex];
    const canFinalize = answeredCount >= MIN_QUESTIONS;
    const progress = Math.min((answeredCount / MIN_QUESTIONS) * 100, 100);

    // ── Voice Recording ──
    const startRecording = async () => {
        try {
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
                // Convert to data URL for storage
                const reader = new FileReader();
                reader.onload = () => {
                    setAudioUrl(reader.result as string);
                };
                reader.readAsDataURL(blob);

                // Speech-to-text transcription
                transcribeAudio();

                stream.getTracks().forEach((t) => t.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAudioUrl(null);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (err) {
            console.error('Mic error:', err);
            alert('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const transcribeAudio = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            // If STT not available, user can type manually
            return;
        }

        setIsTranscribing(true);
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(transcript);
            setIsTranscribing(false);
        };
        recognition.onerror = () => setIsTranscribing(false);
        recognition.onend = () => setIsTranscribing(false);

        recognition.start();
    };

    // Start live STT while recording
    const startLiveRecording = async () => {
        // Start audio recording
        startRecording();

        // Start live STT simultaneously
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
            };
            recognition.onerror = () => { };
            // Store ref to stop later
            (window as any).__sttRef = recognition;
            recognition.start();
        }
    };

    const stopLiveRecording = () => {
        stopRecording();
        try {
            (window as any).__sttRef?.stop();
        } catch { }
    };

    const handleSubmit = useCallback(() => {
        if (!answer.trim() || !cloneId || !currentQuestion) return;
        addAnswer(cloneId, {
            question: currentQuestion.text,
            answer: answer.trim(),
            category: currentQuestion.category,
            audioUrl: audioUrl || undefined,
            isVoice: inputMode === 'voice' && !!audioUrl,
        });
        setAnswer('');
        setAudioUrl(null);
        setAnsweredCount((c) => c + 1);
        setCurrentIndex((i) => i + 1);
    }, [answer, cloneId, currentQuestion, addAnswer, audioUrl, inputMode]);

    const handleSkip = () => {
        setAnswer('');
        setAudioUrl(null);
        setCurrentIndex((i) => i + 1);
    };

    const handleFinalize = () => {
        if (!cloneId) return;
        setIsFinishing(true);
        finalizeClone(cloneId);
        setTimeout(() => {
            router.push('/clones');
        }, 1500);
    };

    const formatTime = (s: number) =>
        `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    if (!cloneId || (!clone && answeredCount === 0)) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <p className="text-charcoal/60">
                    Clon no encontrado.{' '}
                    <button onClick={() => router.push('/create')} className="text-primary underline">
                        Crear uno nuevo
                    </button>
                </p>
            </div>
        );
    }

    if (isFinishing) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center animate-pulse">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-display font-medium text-center">
                    Perfil de <span className="italic text-primary/80">{clone?.name}</span> creado
                </h2>
                <p className="text-charcoal/60 text-center">
                    {answeredCount} respuestas · {clone?.voiceSamples || 0} con voz
                </p>
                <p className="text-charcoal/40 text-sm text-center">Redirigiendo...</p>
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
            <div className="px-6 py-5 flex items-center justify-between border-b border-charcoal/5">
                <div className="text-xl font-display font-semibold tracking-tight italic">Cloned</div>
                <div className="flex items-center gap-3">
                    {/* Voice/Text mode toggle */}
                    <button
                        onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${inputMode === 'voice'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-charcoal/5 text-charcoal/50'
                            }`}
                    >
                        {inputMode === 'voice' ? (
                            <>
                                <Mic className="w-3.5 h-3.5" /> Voz
                            </>
                        ) : (
                            <>
                                <Keyboard className="w-3.5 h-3.5" /> Texto
                            </>
                        )}
                    </button>
                    <div className="text-xs uppercase tracking-widest font-bold text-charcoal/40">
                        Paso 3 de 3
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-charcoal/60">
                        <span className="font-bold text-charcoal">{answeredCount}</span> / {MIN_QUESTIONS} mínimo
                    </span>
                    <div className="flex items-center gap-3">
                        {(clone?.voiceSamples || 0) > 0 && (
                            <span className="text-primary text-xs font-medium flex items-center gap-1">
                                <Mic className="w-3 h-3" /> {clone?.voiceSamples} voz
                            </span>
                        )}
                        {canFinalize && (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Listo
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full h-2 bg-charcoal/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-[#6366f1] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-2 text-[11px] text-charcoal/40 uppercase tracking-widest">
                    Categoría: {currentQuestion?.category}
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full">
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4">
                        Pregunta {answeredCount + 1}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-display font-medium leading-snug mb-8">
                        {currentQuestion?.text}
                    </h2>

                    {inputMode === 'voice' ? (
                        /* ── Voice Mode ── */
                        <div className="flex flex-col items-center gap-6">
                            {/* Record button */}
                            {!isRecording && !audioUrl && (
                                <button
                                    onClick={startLiveRecording}
                                    className="group relative w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-500/30 hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <Mic className="w-10 h-10" />
                                    <span className="absolute -bottom-8 text-xs text-charcoal/50 font-medium whitespace-nowrap">
                                        Mantén presionado para hablar
                                    </span>
                                </button>
                            )}

                            {/* Recording indicator */}
                            {isRecording && (
                                <div className="flex flex-col items-center gap-4">
                                    <button
                                        onClick={stopLiveRecording}
                                        className="w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-95 transition-transform animate-pulse"
                                    >
                                        <Square className="w-8 h-8" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-600 font-mono font-bold text-lg">
                                            {formatTime(recordingTime)}
                                        </span>
                                    </div>
                                    {/* Waveform animation */}
                                    <div className="flex items-center gap-1 h-8">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-red-400 rounded-full"
                                                style={{
                                                    height: `${12 + Math.random() * 20}px`,
                                                    animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Transcription result */}
                            {isTranscribing && (
                                <p className="text-sm text-charcoal/50 animate-pulse">Transcribiendo...</p>
                            )}

                            {audioUrl && !isRecording && (
                                <div className="w-full space-y-4">
                                    {/* Audio playback */}
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mic className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-charcoal/40 font-medium uppercase tracking-widest mb-1">
                                                Respuesta grabada
                                            </p>
                                            <audio src={audioUrl} controls className="w-full h-8" />
                                        </div>
                                    </div>

                                    {/* Transcription */}
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Transcripción (edita si es necesario)..."
                                        rows={3}
                                        className="w-full px-5 py-4 border-2 border-charcoal/10 rounded-2xl focus:border-primary/50 focus:outline-none transition-colors bg-white resize-none text-base"
                                    />

                                    {/* Re-record */}
                                    <button
                                        onClick={() => {
                                            setAudioUrl(null);
                                            setAnswer('');
                                        }}
                                        className="text-sm text-charcoal/50 underline"
                                    >
                                        Volver a grabar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── Text Mode ── */
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
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleSkip}
                        className="px-6 py-4 rounded-full text-charcoal/50 font-medium hover:bg-charcoal/5 transition-colors text-sm"
                    >
                        Omitir
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        className="flex-1 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-6 py-4 rounded-full font-medium shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                    >
                        Siguiente
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Finalize button */}
                {canFinalize && (
                    <button
                        onClick={handleFinalize}
                        className="mt-4 w-full py-4 rounded-full bg-green-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                    >
                        <Sparkles className="w-5 h-5" />
                        Crear Perfil de {clone?.name} ({answeredCount} respuestas · {clone?.voiceSamples || 0} con voz)
                    </button>
                )}
            </div>
        </div>
    );
}
