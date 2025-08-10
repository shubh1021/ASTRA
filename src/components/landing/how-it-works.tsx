import { UploadCloud, Highlighter, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <UploadCloud className="w-12 h-12 text-primary" />,
    title: "1. Upload Securely",
    description: "Drag and drop your legal documents or contracts into our secure, encrypted platform.",
  },
  {
    icon: <Highlighter className="w-12 h-12 text-primary" />,
    title: "2. Analyze & Review",
    description: "Our AI analyzes your document in seconds, highlighting key clauses, risks, and entities.",
  },
  {
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "3. Gain Insights",
    description: "Receive actionable insights, summaries, and suggestions to make informed decisions faster.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container max-w-7xl">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold tracking-tight">Get Started in Three Simple Steps</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Our intuitive workflow makes complex legal analysis effortless.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-border -z-10" style={{ transform: 'translateX(50%)' }}></div>
              )}
              <div className="bg-primary/10 p-5 rounded-full mb-6 border-4 border-background">
                {step.icon}
              </div>
              <h3 className="font-headline text-2xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
