import { HardDrive, Fingerprint, Share2, Download, Mic, Layers } from 'lucide-react';

const features = [
    {
        icon: <HardDrive size={24} />,
        title: "Memoria Contextual",
        desc: "Recuerda conversaciones pasadas y construye una base de conocimiento episódica sobre tu vida."
    },
    {
        icon: <Fingerprint size={24} />,
        title: "Identidad Única",
        desc: "Captura tus valores, estilo de comunicación, muletillas y patrones de razonamiento."
    },
    {
        icon: <Share2 size={24} />,
        title: "Compartir Selectivo",
        desc: "Genera enlaces seguros para que otros interactúen con tu persona digital bajo tus reglas."
    },
    {
        icon: <Download size={24} />,
        title: "Portabilidad",
        desc: "Exporta e importa el estado de tu persona (JSON). Tus datos te pertenecen al 100%."
    },
    {
        icon: <Mic size={24} />,
        title: "Voz Neural",
        desc: "Síntesis de voz realista para una experiencia de conversación fluida y natural."
    },
    {
        icon: <Layers size={24} />,
        title: "Versiones",
        desc: "Mantén diferentes versiones de tu identidad (v1.0, v1.1) a medida que entrenas."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
                    Características Principales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all duration-300">
                            <div className="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
