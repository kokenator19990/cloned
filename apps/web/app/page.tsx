import Link from 'next/link';
import { ArrowRight, Bot, Sparkles, Shield, Share2, Compass } from 'lucide-react';
import LandingHeader from '@/components/landing-page/LandingHeader';
import Footer from '@/components/landing-page/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFAF6] text-[#2D2A26] selection:bg-[#C08552] selection:text-white overflow-hidden">
      <LandingHeader />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-[#C08552]/10 to-transparent rounded-full blur-3xl -z-10 animate-fade-in" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -z-10 animate-float-delay" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-[#E8DFD3] text-sm font-medium text-[#8C8279] animate-slide-up">
              <Sparkles className="w-4 h-4 text-[#C08552]" />
              <span>Inteligencia Artificial Emocional</span>
            </div>

            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-slide-up-delay-1">
              ¿Estás Listo? <br />
              <span className="text-gradient">Crea tu Clon.</span>
            </h1>

            <p className="text-xl text-[#8C8279] max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up-delay-2">
              Preserva tu esencia, tus recuerdos y tu personalidad en una IA eterna.
              Comparte tu legado con quienes más importan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up-delay-3">
              <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-[#2D2A26] text-white rounded-full font-semibold hover:bg-[#C08552] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                Comenzar Ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/clones/explore" className="w-full sm:w-auto px-8 py-4 bg-white border border-[#E8DFD3] text-[#2D2A26] rounded-full font-semibold hover:border-[#C08552] hover:text-[#C08552] transition-colors flex items-center justify-center gap-2">
                <Compass className="w-4 h-4" />
                Explorar Clones
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-[#8C8279] text-sm font-medium animate-slide-up-delay-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Memoria Eterna
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Voz Realista
              </div>
            </div>
          </div>

          {/* Visual: Face & Clone Graphic */}
          <div className="relative animate-fade-in delay-500 hidden lg:block">
            {/* Main Visual Container */}
            <div className="relative w-full aspect-square max-w-[600px] mx-auto">

              {/* Central Composition */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[400px] h-[400px]">
                  {/* Left Face (Human) */}
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-[#2D2A26] rounded-l-full overflow-hidden flex items-center justify-end pr-1 shadow-2xl z-20">
                    {/* Abstract Human Representation */}
                    <div className="w-32 h-32 border-4 border-[#C08552]/30 rounded-full absolute right-10 top-20 blur-sm opacity-50"></div>
                    <div className="w-40 h-40 border-2 border-white/10 rounded-full absolute right-5 top-16"></div>
                    <div className="text-white/10 text-9xl font-bold absolute -right-12 select-none">HUMAN</div>
                  </div>

                  {/* Right Face (Clone) */}
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br from-[#C08552] to-[#2D2A26] rounded-r-full overflow-hidden flex items-center justify-start pl-1 shadow-2xl z-20">
                    {/* Digital Wireframe Effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="w-full h-full border-l border-white/20 relative">
                      <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <div className="absolute top-[60%] left-[50%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-[40%] left-[70%] w-1 h-1 bg-purple-400 rounded-full animate-pulse decoration-clone"></div>

                      {/* Connecting Lines */}
                      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 400">
                        <path d="M0,200 Q50,150 100,200 T200,200" fill="none" stroke="white" strokeWidth="1" />
                        <path d="M0,220 Q60,250 120,220" fill="none" stroke="white" strokeWidth="0.5" />
                      </svg>
                    </div>
                    <div className="text-white/10 text-9xl font-bold absolute -left-12 select-none">AI</div>
                  </div>

                  {/* Central Split Line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/50 to-transparent z-30 h-full"></div>

                  {/* Floating Elements */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center animate-float-slow z-40 border border-white/50">
                    <Bot className="w-10 h-10 text-[#C08552]" />
                  </div>

                  <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-[#2D2A26] rounded-full shadow-xl flex items-center justify-center animate-float-delay z-40 border border-[#E8DFD3]/20">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Orbiting Rings */}
              <div className="absolute inset-0 border border-[#E8DFD3]/30 rounded-full animate-spin-slow-reverse scale-110"></div>
              <div className="absolute inset-0 border border-[#C08552]/20 rounded-full animate-spin-slow scale-125 border-dashed"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clonado Cognitivo</h3>
              <p className="text-[#8C8279]">
                Nuestra IA analiza tus patrones de pensamiento, recuerdos y valores para crear una réplica exacta de tu mente.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Voz Ultra-Realista</h3>
              <p className="text-[#8C8279]">
                Tu clon no solo piensa como tú, también suena como tú. Capturamos tu tono, cadencia y emoción.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-[#E8DFD3] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Compartir Legado</h3>
              <p className="text-[#8C8279]">
                Genera un link único y permite que amigos y familia conversen con tu clon digital en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
