import { cn } from "@/lib/utils";

const AstraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M5 22h14v-2H5v2zm1-3h12v-1H6v1zm-3-3h18v-2H3v2zm3.5-11c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 .9-.5 1.7-1.2 2.1-.2.1-.3.2-.3.4v1h-2v-1c0-.2-.1-.3-.3-.4-.7-.4-1.2-1.2-1.2-2.1zm11 0c0-1.4-1.1-2.5-2.5-2.5S14 4.1 14 5.5c0 .9.5 1.7 1.2 2.1.2.1.3.2.3.4v1h2v-1c0-.2.1-.3.3-.4.7-.4 1.2-1.2 1.2-2.1zM6 14h1.5V9H6v5zm3.5 0H11V9H9.5v5zm2 0h1.5V9H11.5v5zm2.5 0H15V9h-1.5v5z" />
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
