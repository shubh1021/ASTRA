
"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { File as FileIcon, Search, BrainCircuit, Settings, User, LogOut, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const isResizing = useRef(false);
  const pathname = usePathname();

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
    { href: '/dashboard', label: 'Document Analysis', icon: FileIcon },
    { href: '/dashboard/deep-search', label: 'DeepSearch', icon: Search },
    { href: '/dashboard/legal-chatbot', label: 'Legal Question', icon: BrainCircuit },
    { href: '/dashboard/optimization-assistant', label: 'Optimization', icon: Zap },
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
                  "w-full justify-start text-base py-6",
                  pathname === item.href && "bg-secondary"
                )}
              >
                <item.icon className="mr-3 h-5 w-5"/>
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="mt-auto space-y-2">
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
          <Card className="bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">User</p>
                  <p className="text-muted-foreground">user@example.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
