import Link from 'next/link';
import { Menu } from 'lucide-react';

export function LandingHeader() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 hover:opacity-80 transition-opacity">
                    Persona Engine
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <Link href="#how-it-works" className="hover:text-gray-900 transition-colors">Cómo funciona</Link>
                    <Link href="#features" className="hover:text-gray-900 transition-colors">Características</Link>
                    <Link href="#use-cases" className="hover:text-gray-900 transition-colors">Casos de uso</Link>
                    <Link href="#safety" className="hover:text-gray-900 transition-colors">Seguridad</Link>
                </div>

                {/* CTA & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/auth/register"
                        className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Unirse a la beta
                    </Link>
                    <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
