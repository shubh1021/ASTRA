"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string }) => (
    <Link href={href} passHref>
      <span
        className={cn(
          "text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground",
          className
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/20 bg-primary text-primary-foreground">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 text-primary-foreground" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-primary text-primary-foreground border-l-primary-foreground/20">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4 border-primary-foreground/20">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Logo className="h-6 text-primary-foreground" />
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="hover:bg-primary-foreground/10">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="mt-8 flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      {...link}
                      className="text-lg"
                    />
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-4 border-t pt-4 border-primary-foreground/20">
                  <Button variant="ghost" asChild className="w-full text-lg py-6 hover:bg-primary-foreground/10">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full text-lg py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Link href="/login">Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
