import Link from 'next/link';
import {
  ArrowRight,
  Menu,
  ShieldCheck,
  Heart,
  EyeOff,
  Home as HomeIcon,
  Sparkles,
  Feather,
  User
} from 'lucide-react';
import { MemoryGallery } from '@/components/landing/MemoryGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light text-charcoal font-body selection:bg-primary/20">
      {/* Navbar */}
      <nav className="px-6 py-6 flex justify-between items-center sticky top-0 bg-background-light/90 backdrop-blur-md z-50">
        <div className="text-2xl font-display font-semibold tracking-tight italic">Cloned</div>
        <div className="flex items-center gap-4">
          <Link href="/clones" className="text-xs uppercase tracking-widest font-bold hidden sm:block hover:text-primary transition-colors">
            Mis Clones
          </Link>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-charcoal/5 hover:bg-charcoal/10 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative px-6 pt-6 pb-12">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-8">
          <div className="z-10">
            <h1 className="text-5xl md:text-7xl leading-[1.05] font-display font-medium mb-4">
              Crea tu <span className="italic text-primary/80">Clon Digital</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-display italic text-charcoal/80 mb-6">
              Preserva tu esencia para el futuro
            </h2>
            <p className="text-lg leading-relaxed text-charcoal/70 mb-8 max-w-[85%] md:max-w-xl">
              Guarda tu forma de pensar, tu humor, tu voz y tus valores en un Perfil de Memoria. Crea una presencia conversable que tus seres queridos puedan conocer hoy y recordar mañana, con respeto y autenticidad.
            </p>
            <Link href="/create" className="bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-primary/20 flex items-center gap-3 w-fit hover:scale-105 transition-transform">
              Crear mi Clon Digital
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/clones" className="text-sm text-charcoal/50 underline underline-offset-4 hover:text-primary transition-colors mt-2">
              Ya tengo cuenta
            </Link>
          </div>
          <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Family hug soft focus"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAabIpBVnueefUD7yEhY4YJm5vYXnILrebzaSU40mB7qwgm5OeAlgeFbc8F2ZaHXC1VqY2iCVdmbCErysG73GLvGf6faoi0YRexGgIlmDXi0sfvK03S34_gFpb_-bKC4xanExwciTrXA0brXE2PYG3YIML4tXkH4BdQ4iSez9QxDJIEoGRVTN-hy3I6wu11HClpAUTBNlDImeqsP-dqpIUmc7np_c6EeB_khc_InnaByjT5xXeVPO2vlRLeMRZDAxi6oPujQkiJNaQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-light/40 via-transparent to-transparent"></div>
          </div>
        </div>
      </header>

      {/* Memory Gallery */}
      <MemoryGallery />

      {/* Security & Ethics */}
      <section className="px-6 py-24 bg-white/40">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-light italic mb-4">Seguridad y Respeto</h2>
            <div className="w-12 h-px bg-primary/30 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: ShieldCheck,
                title: 'Legado Protegido',
                desc: 'Encriptación de grado militar para asegurar que cada palabra y recuerdo permanezca en el círculo familiar.',
              },
              {
                icon: Heart,
                title: 'Ética Radical',
                desc: 'Desarrollado bajo principios de acompañamiento psicológico y respeto absoluto por el duelo.',
              },
              {
                icon: EyeOff,
                title: 'Privacidad Total',
                desc: 'Tus datos nunca serán vendidos. Eres el único dueño de la memoria que decides preservar.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 flex items-center justify-center border border-charcoal/10 rounded-full mb-6 text-primary">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 pt-24 pb-32">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center text-center gap-10">
            <div className="text-3xl font-display font-semibold italic">Cloned</div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs uppercase tracking-widest font-bold text-charcoal/60">
              <Link href="#">El Proceso</Link>
              <Link href="#">Privacidad</Link>
              <Link href="#">Seguridad</Link>
              <Link href="#">Ética</Link>
            </div>
            <div className="max-w-md">
              <p className="text-[11px] text-charcoal/40 leading-relaxed uppercase tracking-widest italic">
                Descargo de responsabilidad: Cloned es una herramienta de preservación de memoria asistida por IA. No sustituye el proceso de duelo profesional ni pretende reemplazar la presencia física humana.
              </p>
            </div>
            <div className="w-full h-px bg-charcoal/10"></div>
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-charcoal/30 uppercase tracking-[0.4em]">© 2024 CLONED ARTIFICIAL PRESENCE</p>
              <p className="text-[10px] text-charcoal/30 uppercase tracking-[0.2em]">Hecho con respeto y memoria.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-light/95 backdrop-blur-2xl border-t border-charcoal/5 flex justify-around items-center py-4 px-6 pb-8 z-50 md:hidden">
        <button className="flex flex-col items-center gap-1 text-primary">
          <HomeIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Inicio</span>
        </button>
        <Link href="/create" className="flex flex-col items-center gap-1 text-charcoal/40">
          <Sparkles className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Clonar</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-charcoal/40">
          <Feather className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Legado</span>
        </button>
        <Link href="/clones" className="flex flex-col items-center gap-1 text-charcoal/40">
          <User className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Mis Clones</span>
        </Link>
      </div>
    </div>
  );
}
