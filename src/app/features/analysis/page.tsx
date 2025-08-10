
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function FeatureAnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-28">
        <div className="container max-w-4xl text-center">
            <div className="inline-block bg-primary/10 p-4 rounded-full mb-6">
                <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight">AI Document Analysis</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Our AI Document Analysis tool automatically reviews legal documents to identify key clauses, potential risks, and important entities. It provides a comprehensive summary, helping you save time and focus on the most critical aspects of your work. Upload your documents in various formats and let Astra handle the heavy lifting.
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
