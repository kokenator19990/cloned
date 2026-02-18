import LandingHeader from '@/components/landing-page/LandingHeader';
import Hero from '@/components/landing-page/Hero';
import Features from '@/components/landing-page/Features';
import HowItWorks from '@/components/landing-page/HowItWorks';
import UseCases from '@/components/landing-page/UseCases';
import Trust from '@/components/landing-page/Trust';
import Footer from '@/components/landing-page/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-cloned-bg selection:bg-cloned-accent selection:text-white">
      <LandingHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Trust />
      <Footer />
    </main>
  );
}
