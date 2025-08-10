
import Link from 'next/link';
import Logo from '@/components/logo';

export default function Footer() {
  return (
    <footer id="contact" className="bg-secondary border-t">
      <div className="container max-w-7xl py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo className="h-20" />
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Astra, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
