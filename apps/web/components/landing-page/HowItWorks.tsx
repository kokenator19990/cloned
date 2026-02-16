import { UserPlus, MessageSquare, BrainCircuit, Activity } from 'lucide-react';

const steps = [
    {
        icon: <UserPlus size={32} />,
        title: "1. Crea tu perfil",
        desc: "Define el rol base (profesional, personal, creativo) y configura los aspectos básicos de tu clon."
    },
    {
        icon: <MessageSquare size={32} />,
        title: "2. Onboarding conversacional",
        desc: "Responde preguntas profundas diseñadas para capturar tu historia, valores y forma de expresarte."
    },
    {
        icon: <BrainCircuit size={32} />,
        title: "3. Entrenamiento activo",
        desc: "Interactúa con tu persona. Usa 👍/👎 y correcciones para refinar su tono y precisión."
    },
    {
        icon: <Activity size={32} />,
        title: "4. Evolución continua",
        desc: "Tu persona digital aprende de cada interacción, volviéndose más auténtica con el tiempo."
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
                    Cómo funciona
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
