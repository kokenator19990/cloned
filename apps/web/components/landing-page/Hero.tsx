import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                    Crea tu Persona Digital
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Un tú digital con memoria, tono y forma de pensar — entrenado con tus respuestas y feedback.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        href="/auth/register"
                        className="w-full md:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        Probar en beta <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="w-full md:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:scale-[1.02]"
                    >
                        Ver cómo funciona
                    </Link>
                </div>

                <div className="mt-16 text-xs text-gray-400 font-medium tracking-wide uppercase">
                    Confianza • Privacidad • Memoria Eterna
                </div>
            </div>
        </section>
    );
}
