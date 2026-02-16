import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export function Trust() {
    return (
        <section id="safety" className="py-24 px-6 bg-gray-50 border-t border-gray-200">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12 text-gray-900">Privacidad y Control</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center">
                        <ShieldCheck size={40} className="text-gray-900 mb-4" />
                        <h3 className="font-semibold mb-2 text-gray-900">Encriptación Total</h3>
                        <p className="text-sm text-gray-500">Tus datos de entrenamiento están protegidos con estándares industriales.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Lock size={40} className="text-gray-900 mb-4" />
                        <h3 className="font-semibold mb-2 text-gray-900">Solo Tú Accedes</h3>
                        <p className="text-sm text-gray-500">Tú decides quién puede interactuar con tu persona y cuándo.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <EyeOff size={40} className="text-gray-900 mb-4" />
                        <h3 className="font-semibold mb-2 text-gray-900">Derecho al Olvido</h3>
                        <p className="text-sm text-gray-500">Elimina tu perfil y todos los datos asociados en cualquier momento.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
