import { cn } from "@/lib/utils";

const PillarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 22h18" />
    <path d="M5 22V8.5c0-1.2 1-2 2.3-2 1.2 0 2.2.8 2.2 2" />
    <path d="M5 12h4.5" />
    <path d="M16.5 22V8.5c0-1.2 1-2 2.3-2 1.2 0 2.2.8 2.2 2" />
    <path d="M14.5 12h4.5" />
    <path d="M5 8.5h14" />
    <path d="M5 6.5c0-1.5 1.1-2.5 2.5-2.5h9c1.4 0 2.5 1 2.5 2.5" />
  </svg>
);


export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
        <PillarIcon className="h-full w-auto"/>
        <span className="text-2xl font-bold font-serif text-foreground">
            Astra
        </span>
    </div>
  );
}
