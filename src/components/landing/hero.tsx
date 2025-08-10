import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#0B1E3D] to-[#1E4E8C] py-24 md:py-32 lg:py-40">
      <div className="container mx-auto max-w-7xl px-4 text-center text-primary-foreground">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Your AI Legal Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-primary-foreground/80 md:text-xl">
          Leverage cutting-edge AI to analyze documents, answer legal questions, and streamline your workflow with unparalleled accuracy and speed.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="font-cta font-medium text-base">
            <Link href="/login">Get Started for Free</Link>
          </Button>
          <Button asChild variant="link" size="lg" className="font-cta font-medium text-base text-primary-foreground hover:text-primary-foreground/90">
            <Link href="#how-it-works">
              Learn More <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
      <div
        className="absolute inset-0 -z-10 mix-blend-soft-light"
        style={{
          backgroundImage: `
            radial-gradient(at 20% 20%, hsla(215, 64%, 33%, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 20%, hsla(215, 68%, 14%, 0.2) 0px, transparent 50%),
            radial-gradient(at 20% 80%, hsla(215, 64%, 33%, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 80%, hsla(215, 68%, 14%, 0.2) 0px, transparent 50%)
          `,
        }}
      />
    </section>
  );
};

export default Hero;
