
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { File as FileIcon, Search, BrainCircuit, Settings, User, LogOut, Zap, Globe, ChevronsLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

interface Jurisdiction {
  code: string;
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const isResizing = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);

  useEffect(() => {
    const storedJurisdiction = localStorage.getItem('jurisdiction');
    if (storedJurisdiction) {
      setJurisdiction(JSON.parse(storedJurisdiction));
    } else {
        router.push('/jurisdiction');
    }
  }, [router]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 500) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const navItems = [
    { href: '/dashboard', label: 'Document Analysis', description: "Review and analyze documents", icon: FileIcon },
    { href: '/dashboard/deep-search', label: 'DeepSearch', description: "Search across legal databases", icon: Search },
    { href: '/dashboard/legal-chatbot', label: 'Legal Question', description: "Ask context-aware questions", icon: BrainCircuit },
    { href: '/dashboard/optimization-assistant', label: 'Optimization', description: "Optimize clause language", icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <nav 
        className="flex-col bg-background p-4 hidden md:flex relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="mb-8">
          <Link href="/">
            <Logo className="h-20" />
          </Link>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start items-start text-base py-3 h-auto",
                  pathname === item.href && "bg-secondary"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0"/>
                <div className="flex flex-col items-start text-left">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">{item.description}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
        <div className="mt-auto space-y-2">
           {jurisdiction && (
            <Card className="p-3 bg-secondary">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Jurisdiction</p>
                    <p className="font-semibold text-sm">{jurisdiction.name}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/jurisdiction')}>
                    <ChevronsLeftRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-3 h-5 w-5"/>
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-3 h-5 w-5"/>
            Account
          </Button>
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-3 h-5 w-5"/>
              Logout
            </Button>
          </Link>
        </div>
      </nav>
      
      <div 
        className="w-2 cursor-col-resize bg-border hover:bg-primary transition-colors hidden md:block"
        onMouseDown={handleMouseDown}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        {children}
      </div>
    </div>
  );
}
