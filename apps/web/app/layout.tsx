import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cloned — Vuelve a conversar con quien extrañas',
  description: 'Preserva la esencia cognitiva de quienes amas. Crea perfiles de memoria para seguir conversando con ellos.',
  icons: { icon: '/ClonedLogo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
