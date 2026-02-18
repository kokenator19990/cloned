'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Cómo funciona', href: '#how-it-works' },
        { name: 'Características', href: '#features' },
        { name: 'Casos de uso', href: '#use-cases' },
        { name: 'Seguridad', href: '#safety' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-cloned-text text-white flex items-center justify-center font-display font-bold text-xl group-hover:bg-cloned-accent transition-colors">
                        C
                    </div>
                    <span className="font-display font-semibold text-xl tracking-tight text-cloned-text">
                        Cloned
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-cloned-muted hover:text-cloned-accent transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium text-cloned-text hover:text-cloned-accent transition-colors"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        href="/auth/register"
                        className="px-5 py-2.5 bg-cloned-text text-white text-sm font-medium rounded-full hover:bg-cloned-accent transition-colors shadow-lg shadow-cloned-text/10"
                    >
                        Unirse a la beta
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-cloned-text"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-cloned-border overflow-hidden"
                    >
                        <nav className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-cloned-text py-2 border-b border-gray-100"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                href="/auth/register"
                                className="mt-4 w-full py-3 bg-cloned-text text-white text-center rounded-xl font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Unirse a la beta
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
