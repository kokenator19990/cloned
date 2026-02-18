'use client';
import { motion } from 'framer-motion';
import { Brain, Fingerprint, Share2, Globe, Disc, Layers } from 'lucide-react';

const features = [
    {
        icon: <Brain className="w-6 h-6" />,
        title: "Memoria episódica y semántica",
        description: "Tu clon no solo chatea; recuerda. Almacena hechos, anécdotas y relaciones, evolucionando con cada conversación."
    },
    {
        icon: <Fingerprint className="w-6 h-6" />,
        title: "Huella de Identidad",
        description: "Capturamos tu tono, muletillas y estilo cognitivo mediante un proceso de 'enrollment' profundo."
    },
    {
        icon: <Share2 className="w-6 h-6" />,
        title: "Control de Acceso",
        description: "Tú decides quién puede interactuar con su versión digital. Público, privado o solo para herederos."
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: "Portabilidad Total",
        description: "Tu modelo no vive atrapado en una app. Expórtalo, llévatelo o ejecútalo localmente (coming soon)."
    },
    {
        icon: <Disc className="w-6 h-6" />,
        title: "Modo Voz Activa",
        description: "Habla con tu clon en tiempo real. Síntesis de voz neural que imita tu cadencia y timbre."
    },
    {
        icon: <Layers className="w-6 h-6" />,
        title: "Versionado de Personalidad",
        description: "Crea diferentes facetas de ti mismo (Profesional, Familiar, Creativo) y gestiónalas independientemente."
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="text-cloned-accent font-medium tracking-wider text-sm uppercase mb-3 block">Capacidades</span>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-cloned-text mb-6">
                        Más que un chat. <br /> Una mente digital.
                    </h2>
                    <p className="text-lg text-cloned-muted">
                        Un sistema operativo para tu identidad que combina LLMs avanzados con una arquitectura de memoria persistente.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            className="group p-8 rounded-3xl bg-cloned-bg border border-cloned-border/50 hover:border-cloned-accent/30 hover:shadow-xl hover:shadow-cloned-accent/5 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-white rounded-2xl border border-cloned-border flex items-center justify-center text-cloned-accent mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-display font-medium text-cloned-text mb-3 group-hover:text-cloned-accent transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-cloned-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
