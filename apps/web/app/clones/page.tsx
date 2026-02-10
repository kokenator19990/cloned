'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStore } from '@/lib/localStore';
import { Plus, MessageCircle, Trash2, User, Mic } from 'lucide-react';
import Link from 'next/link';

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
                        <div className="w-20 h-20 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
                            <User className="w-10 h-10 text-charcoal/20" />
                        </div>
                        <h3 className="text-xl font-display font-medium mb-2">No tienes clones aún</h3>
                        <p className="text-charcoal/50 mb-8">Crea tu primer Clon Digital respondiendo algunas preguntas.</p>
                        <Link
                            href="/create"
                            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
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
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-charcoal/5 flex-shrink-0">
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
                                    <p className="text-sm text-charcoal/50">
                                        {clone.answers.length} respuestas
                                        {(clone.voiceSamples || 0) > 0 && (
                                            <span className="inline-flex items-center gap-1 ml-1.5 text-primary"><Mic className="w-3 h-3" />{clone.voiceSamples}</span>
                                        )}
                                        <span className="mx-1">·</span>
                                        {new Date(clone.createdAt).toLocaleDateString('es')}
                                    </p>
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
                                        className="p-2 rounded-full text-charcoal/30 hover:text-red-500 hover:bg-red-50 transition-colors"
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

                        {/* In-progress clones */}
                        {inProgressClones.map((clone) => (
                            <div
                                key={clone.id}
                                className="bg-white/50 rounded-2xl border border-dashed border-charcoal/10 p-5 flex items-center gap-5 cursor-pointer hover:border-primary/30 transition-colors"
                                onClick={() => router.push(`/create/questions?id=${clone.id}`)}
                            >
                                <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                    <User className="w-8 h-8 text-charcoal/20" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-display font-medium text-charcoal/60">{clone.name}</h3>
                                    <p className="text-sm text-charcoal/40">
                                        En progreso · {clone.answers.length} respuestas
                                    </p>
                                </div>
                                <span className="text-xs uppercase tracking-widest font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                    Continuar
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
