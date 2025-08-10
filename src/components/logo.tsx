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
        <path d="M12 2l2.5 6.5L21 10l-5.5 5 1.5 7L12 18l-5 4 1.5-7-5.5-5 6.5-1.5L12 2z" />
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
