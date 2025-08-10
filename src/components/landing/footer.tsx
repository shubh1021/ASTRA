import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0B1E3D] text-primary-foreground">
      <div className="container max-w-7xl py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Scale className="h-7 w-7" />
            <span className="font-headline text-2xl font-bold">
              LexAI
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} LexAI, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
