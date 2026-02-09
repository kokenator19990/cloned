import Link from 'next/link';
import Image from 'next/image';
import { Heart, Shield, Eye, Lock, MessageCircle, Brain, Mic2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-cloned-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cloned-bg/80 border-b border-cloned-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/ClonedLogo.png" alt="Cloned" width={36} height={36} className="rounded-lg" />
            <span className="font-display text-xl font-semibold text-cloned-text">Cloned</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="px-5 py-2 text-sm font-medium text-cloned-muted hover:text-cloned-text transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/auth/register" className="px-5 py-2 text-sm font-medium bg-cloned-accent hover:bg-cloned-accent-dark text-white rounded-full transition-colors">
              Comenzar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cloned-hero to-cloned-bg">
        <div className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
          <div className="mb-8">
            <Image src="/ClonedLogo.png" alt="Cloned" width={80} height={80} className="mx-auto rounded-2xl shadow-lg animate-float" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cloned-text leading-tight mb-6">
            Vuelve a conversar<br />
            <span className="text-cloned-accent">con quien extrañas</span>
          </h1>
          <p className="text-lg md:text-xl text-cloned-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Preserva la esencia cognitiva de quienes amas. Recrea sus formas de pensar,
            sus valores, su humor y su manera de ver el mundo — para que la conversación
            nunca tenga que terminar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cloned-accent hover:bg-cloned-accent-dark text-white rounded-full text-lg font-medium transition-all shadow-lg shadow-cloned-accent/25 hover:shadow-xl hover:shadow-cloned-accent/30">
              Crear un Perfil de Memoria
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-cloned-border hover:border-cloned-accent/40 text-cloned-text rounded-full text-lg font-medium transition-colors">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 -left-32 w-64 h-64 bg-cloned-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-64 h-64 bg-cloned-accent/5 rounded-full blur-3xl" />
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-cloned-text mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-cloned-muted mb-16 max-w-xl mx-auto">
            Tres pasos para preservar la esencia de quien amas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Brain,
                title: 'Enrollment Cognitivo',
                desc: 'Responde preguntas sobre cómo piensa, qué valora y cómo se expresa la persona. Cada respuesta construye su huella cognitiva única.',
              },
              {
                step: '02',
                icon: MessageCircle,
                title: 'Conversación',
                desc: 'Una vez activado el perfil, conversa con la esencia cognitiva. El sistema recrea sus patrones de razonamiento, humor y emociones.',
              },
              {
                step: '03',
                icon: Mic2,
                title: 'Voz y Presencia',
                desc: 'Agrega muestras de voz y personaliza el avatar para una experiencia más cercana e inmersiva.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-cloned-border hover:border-cloned-accent/30 transition-colors group">
                <span className="absolute top-6 right-6 text-5xl font-display font-bold text-cloned-soft group-hover:text-cloned-accent/10 transition-colors">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-cloned-soft flex items-center justify-center mb-5 group-hover:bg-cloned-accent/10 transition-colors">
                  <item.icon className="w-6 h-6 text-cloned-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold text-cloned-text mb-3">{item.title}</h3>
                <p className="text-cloned-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory Gallery (Emotional Section) */}
      <section className="py-20 px-6 bg-cloned-soft/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-cloned-text mb-4">
            Una galería de recuerdos vivos
          </h2>
          <p className="text-center text-cloned-muted mb-16 max-w-xl mx-auto">
            Cada perfil es una constelación de memorias, valores y formas de ser que hacen única a una persona
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Valores', emoji: '💎', color: 'from-amber-50 to-orange-50' },
              { label: 'Humor', emoji: '😄', color: 'from-yellow-50 to-amber-50' },
              { label: 'Sueños', emoji: '✨', color: 'from-purple-50 to-pink-50' },
              { label: 'Recuerdos', emoji: '📸', color: 'from-blue-50 to-cyan-50' },
              { label: 'Opiniones', emoji: '💭', color: 'from-green-50 to-emerald-50' },
              { label: 'Emociones', emoji: '❤️', color: 'from-red-50 to-rose-50' },
              { label: 'Lenguaje', emoji: '🗣️', color: 'from-indigo-50 to-blue-50' },
              { label: 'Lógica', emoji: '🧩', color: 'from-teal-50 to-green-50' },
            ].map((item) => (
              <div
                key={item.label}
                className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-center border border-white/60 hover:scale-105 transition-transform cursor-default shadow-sm`}
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <span className="text-sm font-medium text-cloned-text">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Ethics */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-cloned-text mb-4">
            Diseñado con respeto y ética
          </h2>
          <p className="text-center text-cloned-muted mb-16 max-w-xl mx-auto">
            Tu privacidad y la dignidad de los recuerdos son nuestra prioridad
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Consentimiento',
                desc: 'Cada perfil requiere consentimiento explícito. Nada se crea sin autorización clara y verificable.',
              },
              {
                icon: Eye,
                title: 'Transparencia',
                desc: 'Siempre se indica claramente que se trata de una simulación. Nunca pretendemos reemplazar a una persona real.',
              },
              {
                icon: Lock,
                title: 'Control Total',
                desc: 'Tú decides qué datos se usan, puedes pausar o eliminar cualquier perfil en cualquier momento.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-8 border border-cloned-border text-center">
                <div className="w-14 h-14 rounded-full bg-cloned-soft mx-auto mb-5 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-cloned-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-cloned-text mb-3">{item.title}</h3>
                <p className="text-cloned-muted leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-cloned-bg to-cloned-hero">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-12 h-12 text-cloned-accent mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cloned-text mb-4">
            Los recuerdos merecen seguir vivos
          </h2>
          <p className="text-cloned-muted mb-10 text-lg max-w-xl mx-auto">
            Comienza hoy a preservar la esencia de quien amas. Es gratuito y siempre lo será.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-10 py-4 bg-cloned-accent hover:bg-cloned-accent-dark text-white rounded-full text-lg font-medium transition-all shadow-lg shadow-cloned-accent/25">
            Empezar Ahora
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cloned-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/ClonedLogo.png" alt="Cloned" width={24} height={24} className="rounded" />
            <span className="text-sm text-cloned-muted">Cloned — Simulación cognitiva con ética y respeto</span>
          </div>
          <p className="text-xs text-cloned-muted">
            ⚠️ Cloned genera simulaciones basadas en IA. No pretende reemplazar a personas reales.
          </p>
        </div>
      </footer>
    </div>
  );
}
