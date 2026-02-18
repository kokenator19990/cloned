'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-cloned-bg pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-cloned-accent/5 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-100/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-cloned-accent/10 text-cloned-accent text-sm font-medium tracking-wide mb-6 border border-cloned-accent/20">
                        PERSONA ENGINE v1.0
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-medium text-cloned-text leading-tight mb-6">
                        Inmortaliza tu esencia. <br />
                        <span className="italic text-cloned-muted">Crea tu legado digital.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-cloned-muted mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Una plataforma de simulación cognitiva que preserva tus patrones de razonamiento, valores y voz.
                    No es solo un chatbot; es tu extensión digital en el tiempo.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href="/waitlist" // Placeholder for now
                        className="group flex items-center gap-2 px-8 py-4 bg-cloned-text text-white rounded-full font-medium hover:bg-black transition-all hover:scale-105 shadow-lg shadow-black/5"
                    >
                        Unirse a la Beta
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 px-8 py-4 bg-white border border-cloned-border text-cloned-text rounded-full font-medium hover:bg-cloned-soft transition-all hover:scale-105"
                    >
                        <PlayCircle className="w-4 h-4 text-cloned-accent" />
                        Ver Demo
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
