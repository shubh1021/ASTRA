
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Search, BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: "Legal Question Chatbot",
    description: "Get instant, context-aware answers to complex legal questions. Supports text, images, and PDF uploads.",
    href: "/features/chatbot"
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "AI Document Analysis",
    description: "Automatically review clauses, identify risks, and get a summary of key points in your legal documents.",
    href: "/features/analysis"
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Intelligent DeepSearch",
    description: "Search across case law, statutes, and your own documents with our powerful semantic search engine.",
    href: "/features/deepsearch"
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Clause Optimizer",
    description: "Improve the clarity and strength of your legal clauses with AI-powered suggestions and optimizations.",
    href: "/features/optimizer"
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary">
      <div className="container max-w-7xl">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight">A Smarter Way to Practice Law</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Astra provides a suite of powerful tools designed to enhance your legal research and document management.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Link href={feature.href} key={index}>
              <Card className="flex flex-col items-center text-center p-8 bg-background border-2 border-transparent hover:border-primary hover:shadow-2xl transition-all duration-300 h-full">
                <CardHeader className="p-0">
                  <div className="bg-primary/10 p-4 rounded-full mb-6">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-serif text-2xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
