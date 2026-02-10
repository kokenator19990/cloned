'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalStore } from '@/lib/localStore';
import { QUESTIONS, MIN_QUESTIONS, TOTAL_QUESTIONS, CATEGORIES } from '@/lib/questions';
import { ArrowRight, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

export default function QuestionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cloneId = searchParams.get('id');
    const { loadClones, getClone, addAnswer, finalizeClone } = useLocalStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

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

    const currentQuestion = shuffled[currentIndex];
    const canFinalize = answeredCount >= MIN_QUESTIONS;
    const progress = Math.min((answeredCount / MIN_QUESTIONS) * 100, 100);

    const handleSubmit = useCallback(() => {
        if (!answer.trim() || !cloneId || !currentQuestion) return;
        addAnswer(cloneId, {
            question: currentQuestion.text,
            answer: answer.trim(),
            category: currentQuestion.category,
        });
        setAnswer('');
        setAnsweredCount((c) => c + 1);
        setCurrentIndex((i) => i + 1);
    }, [answer, cloneId, currentQuestion, addAnswer]);

    const handleSkip = () => {
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

    if (!cloneId || (!clone && answeredCount === 0)) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <p className="text-charcoal/60">Clon no encontrado. <button onClick={() => router.push('/create')} className="text-primary underline">Crear uno nuevo</button></p>
            </div>
        );
    }

    if (isFinishing) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-display font-medium text-center">
                    Perfil de <span className="italic text-primary/80">{clone?.name}</span> creado
                </h2>
                <p className="text-charcoal/60 text-center">
                    {answeredCount} respuestas registradas. Redirigiendo...
                </p>
            </div>
        );
    }

    if (currentIndex >= shuffled.length) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 px-6">
                <h2 className="text-3xl font-display font-medium text-center">
                    ¡Has respondido todas las preguntas!
                </h2>
                <button onClick={handleFinalize} className="bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl flex items-center gap-3">
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
                <div className="text-xs uppercase tracking-widest font-bold text-charcoal/40">
                    Paso 3 de 3
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-charcoal/60">
                        <span className="font-bold text-charcoal">{answeredCount}</span> / {MIN_QUESTIONS} mínimo
                    </span>
                    {canFinalize && (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Listo para crear
                        </span>
                    )}
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
            <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4">
                        Pregunta {answeredCount + 1}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-display font-medium leading-snug mb-8">
                        {currentQuestion?.text}
                    </h2>
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

                {/* Finalize button (appears after MIN_QUESTIONS) */}
                {canFinalize && (
                    <button
                        onClick={handleFinalize}
                        className="mt-4 w-full py-4 rounded-full bg-green-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                    >
                        <Sparkles className="w-5 h-5" />
                        Crear Perfil de {clone?.name} ({answeredCount} respuestas)
                    </button>
                )}
            </div>
        </div>
    );
}
