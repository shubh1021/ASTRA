
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const jurisdictions = [
  {
    code: 'US',
    name: 'United States',
    description: 'Federal and state law',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    description: 'English, Scottish, Welsh, and Northern Irish law',
  },
  {
    code: 'CA',
    name: 'Canada',
    description: 'Federal and provincial law',
  },
  {
    code: 'AU',
    name: 'Australia',
    description: 'Commonwealth and state law',
  },
  {
    code: 'DE',
    name: 'Germany',
    description: 'Federal and state law',
  },
  {
    code: 'FR',
    name: 'France',
    description: 'French civil law',
  },
];

export default function JurisdictionPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div 
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/grid-bg.svg')"}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>
      <div className="w-full max-w-4xl">
        <Card className="bg-secondary/30 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Choose your jurisdiction</h1>
            <p className="text-muted-foreground mt-2">Select the legal system you want to work with.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jurisdictions.map((j) => (
              <button
                key={j.code}
                onClick={() => setSelectedJurisdiction(j.code)}
                className={cn(
                  "flex items-center text-left p-4 rounded-lg border-2 transition-colors",
                  selectedJurisdiction === j.code
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/30 hover:bg-background/70"
                )}
              >
                <div className="flex-shrink-0 w-12 text-2xl font-bold text-muted-foreground">{j.code}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{j.name}</h3>
                  <p className="text-sm text-muted-foreground">{j.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
             <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedJurisdiction}
                className="w-full max-w-xs"
              >
                Continue to Services
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            <p className="text-muted-foreground text-sm mt-4">
              You can change your jurisdiction later in your account settings.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
