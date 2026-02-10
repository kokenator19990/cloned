'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStore, depthLabel, depthColor } from '@/lib/localStore';
import { Plus, MessageCircle, Trash2, User, Mic, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const MIN_QUESTIONS = 25;

export default function ClonesPage() {
    const { clones, loadClones, deleteClone } = useLocalStore();
    const router = useRouter();

    useEffect(() => {
        loadClones();
    }, [loadClones]);

    const readyClones = clones.filter((c) => c.status === 'ready');
    const inProgressClones = clones.filter((c) => c.status === 'creating');

    return (
        <div className="min-h-screen bg-background-light text-charcoal font-body">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between border-b border-charcoal/5">
                <Link href="/" className="text-2xl font-display font-semibold tracking-tight italic">Cloned</Link>
                <Link
                    href="/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Clon
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-3xl md:text-4xl font-display font-medium mb-2">Mis Clones</h1>
                <p className="text-charcoal/50 mb-10">Elige con quién quieres hablar</p>

                {readyClones.length === 0 && inProgressClones.length === 0 ? (
                    /* Empty state */
                    <div className="text-center py-20">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-[#6366f1]/10 flex items-center justify-center mx-auto mb-6">
                            <Mic className="w-12 h-12 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-display font-medium mb-2">No tienes clones aún</h3>
                        <p className="text-charcoal/50 mb-8">Crea tu primer Clon Digital grabando tu voz<br />y respondiendo preguntas sobre ti.</p>
                        <Link
                            href="/create"
                            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                        >
                            <Mic className="w-5 h-5" />
                            Crear mi primer Clon
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Ready clones */}
                        {readyClones.map((clone) => (
                            <div
                                key={clone.id}
                                className="group bg-white rounded-2xl border border-charcoal/5 p-5 flex items-center gap-5 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
                                onClick={() => router.push(`/clones/${clone.id}/chat`)}
                            >
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-charcoal/5 flex-shrink-0 border-2 border-charcoal/10 group-hover:border-primary/30 transition-colors">
                                    {clone.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={clone.photoUrl} alt={clone.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-charcoal/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-display font-medium">{clone.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-sm text-charcoal/50">
                                            {clone.answers.length} respuestas
                                            {(clone.voiceSamples || 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 ml-1.5 text-red-500">
                                                    <Mic className="w-3 h-3" />{clone.voiceSamples}
                                                </span>
                                            )}
                                        </p>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${depthColor(clone.depth || 'basic')}`}>
                                            {depthLabel(clone.depth || 'basic')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`¿Eliminar "${clone.name}"? No se puede deshacer.`)) {
                                                deleteClone(clone.id);
                                            }
                                        }}
                                        className="p-2 rounded-full text-charcoal/20 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        Hablar
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Ready clones: "deepen" CTA */}
                        {readyClones.filter((c) => (c.answers?.length || 0) < 200).map((clone) => (
                            <button
                                key={`deepen-${clone.id}`}
                                onClick={() => router.push(`/create/questions?id=${clone.id}`)}
                                className="w-full text-left px-5 py-3 bg-primary/3 border border-primary/10 rounded-xl flex items-center gap-3 hover:bg-primary/5 transition-colors text-sm"
                            >
                                <ArrowRight className="w-4 h-4 text-primary/50" />
                                <span className="text-charcoal/60">
                                    <span className="font-medium text-primary">{clone.name}</span> — seguir entrevistando para un perfil más profundo
                                </span>
                            </button>
                        ))}

                        {/* In-progress clones */}
                        {inProgressClones.map((clone) => {
                            const hasMinimum = clone.answers.length >= MIN_QUESTIONS;
                            
                            return (
                                <div
                                    key={clone.id}
                                    className="bg-white/50 rounded-2xl border border-dashed border-charcoal/10 p-5 flex items-center gap-5"
                                >
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                        {clone.photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={clone.photoUrl} alt={clone.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-charcoal/20" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-display font-medium text-charcoal/60">{clone.name}</h3>
                                        <p className="text-sm text-charcoal/40">
                                            En progreso · {clone.answers.length} respuestas
                                            {(clone.voiceSamples || 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 ml-1 text-red-400">
                                                    <Mic className="w-3 h-3" />{clone.voiceSamples}
                                                </span>
                                            )}
                                        </p>
                                        {!hasMinimum && (
                                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                                Faltan {MIN_QUESTIONS - clone.answers.length} respuestas para activar
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Si tiene menos de 25: solo botón continuar */}
                                    {!hasMinimum ? (
                                        <button
                                            onClick={() => router.push(`/create/questions?id=${clone.id}`)}
                                            className="text-xs uppercase tracking-widest font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors"
                                        >
                                            Continuar
                                        </button>
                                    ) : (
                                        /* Si tiene 25+: dos opciones */
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/create/questions?id=${clone.id}`)}
                                                className="text-xs uppercase tracking-widest font-bold text-charcoal/40 hover:text-charcoal/60 px-3 py-2 rounded-full hover:bg-charcoal/5 transition-colors"
                                            >
                                                Completar
                                            </button>
                                            <button
                                                onClick={() => router.push(`/clones/${clone.id}/chat-hybrid`)}
                                                className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-br from-[#1313ec] to-[#6366f1] px-5 py-2.5 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                                            >
                                                <Zap className="w-4 h-4" />
                                                Hablar con {clone.name}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
