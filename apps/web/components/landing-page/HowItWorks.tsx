'use client';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquareText, Sparkles, LockKeyhole } from 'lucide-react';

const steps = [
    {
        icon: <UserPlus className="w-6 h-6" />,
        title: "1. Crea tu perfil",
        description: "Define el rol base (profesional, personal, creativo) y configura los aspectos básicos de tu clon."
    },
    {
        icon: <MessageSquareText className="w-6 h-6" />,
        title: "2. Onboarding conversacional",
        description: "Responde preguntas profundas diseñadas para capturar tu historia, valores y forma de expresarte."
    },
    {
        icon: <Sparkles className="w-6 h-6" />,
        title: "3. Entrenamiento activo",
        description: "Interactúa con tu persona. Usa 👍 / 👎 y correcciones para refinar su tono y precisión."
    },
    {
        icon: <LockKeyhole className="w-6 h-6" />,
        title: "4. Preservación Segura",
        description: "Tu modelo se congela y encripta. Solo tú (o quienes autorices) pueden activarlo."
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-cloned-bg border-y border-cloned-border/40">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="mb-20 text-center">
                    <span className="text-cloned-accent font-medium tracking-wider text-sm uppercase mb-3 block">Proceso</span>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-cloned-text mb-6">
                        Cómo funciona
                    </h2>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cloned-border to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-cloned-border flex items-center justify-center text-cloned-muted mb-8 relative z-10 group-hover:border-cloned-accent group-hover:text-cloned-accent transition-colors shadow-sm">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-display font-medium text-cloned-text mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-cloned-muted leading-relaxed text-sm">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
