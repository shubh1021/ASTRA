import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import HowItWorks from '@/components/landing/how-it-works';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
