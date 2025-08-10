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
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
