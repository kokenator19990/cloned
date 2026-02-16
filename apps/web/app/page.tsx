import { LandingHeader } from '@/components/landing-page/LandingHeader';
import { Hero } from '@/components/landing-page/Hero';
import { Features } from '@/components/landing-page/Features';
import { UseCases } from '@/components/landing-page/UseCases';
import { HowItWorks } from '@/components/landing-page/HowItWorks';
import { Trust } from '@/components/landing-page/Trust';
import { Footer } from '@/components/landing-page/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <UseCases />
        <Trust />
      </main>
      <Footer />
    </div>
  );
}
