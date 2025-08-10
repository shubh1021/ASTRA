import { cn } from "@/lib/utils";

const AstraIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
        <path d="M4 22h16" />
        <path d="M6 18h12" />
        <path d="M6 15h12" />
        <path d="M12 15v3" />
        <path d="M8 15v3" />
        <path d="M16 15v3" />
        <path d="M5.5 12.5c0-1.5 1-2.5 2-2.5h9c1 0 2 1 2 2.5" />
        <path d="M5.5 10c0-1.5 1-2.5 2-2.5h9c1 0 2 1 2 2.5" />
        <path d="M3 5c2-2 4-2 6-2s4 0 6 2" />
    </svg>
);


export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
        <AstraIcon className="h-full w-auto"/>
        <span className="text-2xl font-bold font-serif text-foreground">
            Astra
        </span>
    </div>
  );
}
