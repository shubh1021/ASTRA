
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function FeatureDeepSearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-28">
        <div className="container max-w-4xl text-center">
            <div className="inline-block bg-primary/10 p-4 rounded-full mb-6">
                <Search className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight">Intelligent DeepSearch</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Go beyond simple keyword matching. Our Intelligent DeepSearch uses semantic understanding to find the most relevant information across vast databases of case law, statutes, and your firm's internal documents. Filter by jurisdiction, date, and legal topic to pinpoint the exact information you need.
            </p>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/#features">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Features
                    </Link>
                </Button>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
