"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-br from-[#0B1E3D] to-[#1E4E8C] p-8 md:p-12 text-white hidden md:flex flex-col justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-8">
              <Scale className="h-8 w-8 text-white" />
              <span className="font-headline text-3xl font-bold">
                LexAI
              </span>
            </Link>
            <h2 className="font-headline text-4xl font-semibold">
              Unlock the Future of Legal Tech.
            </h2>
            <p className="mt-4 text-white/80">
              Join thousands of legal professionals who trust LexAI to enhance their practice.
            </p>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} LexAI, Inc.</p>
        </div>
        
        <Card className="rounded-none border-none p-4 sm:p-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className='font-body'>Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full font-cta font-medium text-base py-6" onClick={handleSignIn}>Sign In</Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full font-cta font-medium" onClick={handleSignIn}>
              Sign in with Google
            </Button>
             <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link href="#" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
