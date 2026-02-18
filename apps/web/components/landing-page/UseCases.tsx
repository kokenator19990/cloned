'use client';

const useCases = [
    {
        title: "Legado Profesional",
        desc: "Entrena un clon con tus papers, correos y decisiones. Permite que tus mentorados te consulten incluso cuando no estás.",
        color: "bg-blue-50 border-blue-100 text-blue-900"
    },
    {
        title: "Memoria Familiar",
        desc: "Preserva las historias del abuelo, sus chistes y su voz. Un tesoro interactivo para las futuras generaciones.",
        color: "bg-amber-50 border-amber-100 text-amber-900"
    },
    {
        title: "Gemelo Creativo",
        desc: "Un 'sparring' intelectual que piensa como tú pero no se cansa. Úsalo para brainstormings o para superar bloqueos.",
        color: "bg-purple-50 border-purple-100 text-purple-900"
    }
];

export default function UseCases() {
    return (
        <section id="use-cases" className="py-24 bg-cloned-bg relative">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-cloned-accent font-medium tracking-wider text-sm uppercase mb-3 block">Aplicaciones</span>
                        <h2 className="text-4xl font-display font-medium text-cloned-text mb-6">
                            Para qué sirve un clon digital
                        </h2>
                        <p className="text-lg text-cloned-muted mb-8 leading-relaxed">
                            Desde preservar la historia familiar hasta escalar tu mentoría profesional.
                            Persona Engine adapta la fidelidad y la base de conocimiento según el objetivo.
                        </p>
                        <button className="text-cloned-accent font-medium hover:text-cloned-text transition-colors flex items-center gap-2 group">
                            Explorar todos los casos
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {useCases.map((uc, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-2xl bg-white border border-cloned-border hover:border-cloned-accent/30 shadow-sm hover:shadow-md transition-all"
                            >
                                <h3 className="text-xl font-bold text-cloned-text mb-2">{uc.title}</h3>
                                <p className="text-cloned-muted">{uc.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
