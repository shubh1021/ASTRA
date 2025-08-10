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
       <path d="M6 12h12" />
       <path d="M6 9h12" />
       <path d="M6 6h12" />
       <path d="M6 3h12" />
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
