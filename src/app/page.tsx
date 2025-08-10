
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import dynamic from 'next/dynamic';

const Features = dynamic(() => import('@/components/landing/features'));
const HowItWorks = dynamic(() => import('@/components/landing/how-it-works'));
const Footer = dynamic(() => import('@/components/landing/footer'));


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
