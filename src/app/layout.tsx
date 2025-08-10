
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Source_Serif_4 } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sourceSerif4 = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif-4', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'Astra',
  description: 'Your AI Legal Assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <body className={`${inter.variable} ${sourceSerif4.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
