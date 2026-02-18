'use client';
import { ShieldCheck, EyeOff, Trash2 } from 'lucide-react';

export default function Trust() {
    return (
        <section id="safety" className="py-24 bg-white border-b border-cloned-border/40">
            <div className="container mx-auto px-6 max-w-5xl text-center">
                <div className="mb-16">
                    <span className="text-cloned-accent font-medium tracking-wider text-sm uppercase mb-3 block">Seguridad</span>
                    <h2 className="text-3xl md:text-4xl font-display font-medium text-cloned-text mb-6">
                        Tus datos. Tu propiedad. Tu legado.
                    </h2>
                    <p className="text-lg text-cloned-muted max-w-2xl mx-auto">
                        Diseñado con privacidad por defecto. No vendemos tus datos ni los usamos para entrenar modelos globales sin tu consentimiento explícito.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-cloned-bg hover:bg-white border border-transparent hover:border-cloned-border transition-colors group">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-6 text-cloned-muted group-hover:text-cloned-success transition-colors" />
                        <h3 className="text-lg font-bold text-cloned-text mb-3">Encriptación Militar</h3>
                        <p className="text-cloned-muted text-sm">Tus memorias se almacenan encriptadas en reposo. Solo tu llave privada puede descifrarlas.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-cloned-bg hover:bg-white border border-transparent hover:border-cloned-border transition-colors group">
                        <EyeOff className="w-10 h-10 mx-auto mb-6 text-cloned-muted group-hover:text-cloned-accent transition-colors" />
                        <h3 className="text-lg font-bold text-cloned-text mb-3">Acceso Granular</h3>
                        <p className="text-cloned-muted text-sm">Comparte solo lo que quieras. Crea perfiles públicos limitados o privados completos.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-cloned-bg hover:bg-white border border-transparent hover:border-cloned-border transition-colors group">
                        <Trash2 className="w-10 h-10 mx-auto mb-6 text-cloned-muted group-hover:text-cloned-danger transition-colors" />
                        <h3 className="text-lg font-bold text-cloned-text mb-3">Derecho al Olvido</h3>
                        <p className="text-cloned-muted text-sm">Borra tu clon y todos sus datos asociados permanentemente en cualquier momento con un clic.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
