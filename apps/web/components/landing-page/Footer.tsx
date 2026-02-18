import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-cloned-text text-white/90 pt-20 pb-10">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="font-display font-bold text-2xl text-white mb-6 block">
                            Cloned.
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Cognitive Identity Simulation Platform.
                            <br />
                            Preservando la esencia humana en código.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Plataforma</h4>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                            <li><a href="#how-it-works" className="hover:text-white transition-colors">Cómo funciona</a></li>
                            <li><a href="#safety" className="hover:text-white transition-colors">Privacidad</a></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Recursos</h4>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/docs" className="hover:text-white transition-colors">Documentación</Link></li>
                            <li><Link href="/status" className="hover:text-white transition-colors">Estado del sistema</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-white/40">
                        © 2026 Deadbot / Cloned Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-white/60 hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors"><Github size={20} /></a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors"><Mail size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
