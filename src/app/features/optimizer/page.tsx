
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function FeatureOptimizerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-28">
        <div className="container max-w-4xl text-center">
            <div className="inline-block bg-primary/10 p-4 rounded-full mb-6">
                <Zap className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight">Clause Optimizer</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Strengthen your legal writing with our Clause Optimizer. This tool analyzes your drafted clauses and suggests improvements for clarity, precision, and legal robustness. It helps you avoid ambiguity and ensure your contracts are as solid as possible, tailored to the specific context and jurisdiction.
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
