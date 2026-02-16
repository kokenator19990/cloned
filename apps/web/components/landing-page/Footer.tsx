import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white py-12 px-6 border-t border-gray-100">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <div className="font-bold text-lg text-gray-900 mb-1">Persona Engine</div>
                    <div className="text-xs text-gray-400">© 2026 Artificial Presence Labs</div>
                </div>

                <div className="flex gap-8 text-sm text-gray-500">
                    <Link href="#" className="hover:text-gray-900 transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-gray-900 transition-colors">GitHub</Link>
                    <Link href="#" className="hover:text-gray-900 transition-colors">Docs</Link>
                </div>
            </div>
        </footer>
    );
}
