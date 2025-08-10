import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40">
       <div className="absolute inset-0 -z-10">
        <Image
          src="https://placehold.co/1600x900.png"
          alt="Abstract background image representing legal technology"
          data-ai-hint="abstract technology"
          fill
          priority
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 text-center relative">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Your AI Legal Assistant
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
          Leverage cutting-edge AI to analyze documents, answer legal questions, and streamline your workflow with unparalleled accuracy and speed.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/login">Get Started for Free</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-foreground hover:bg-background/20">
            <Link href="#how-it-works">
              Learn More <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
