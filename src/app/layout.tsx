
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  weight: ['400', '500', '600', '700'],
});
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
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} ${sourceSerif4.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
