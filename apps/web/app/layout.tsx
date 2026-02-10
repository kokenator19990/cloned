import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic']
});

const basePath = process.env.GH_PAGES === 'true' ? '/cloned' : '';

export const metadata: Metadata = {
  title: 'Cloned — Vuelve a conversar con quien extrañas',
  description: 'Preserva la esencia cognitiva de quienes amas. Crea perfiles de memoria para seguir conversando con ellos.',
  icons: { icon: `${basePath}/ClonedLogo.png` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${newsreader.variable} antialiased bg-background-light text-charcoal`}>
        {children}
      </body>
    </html>
  );
}
