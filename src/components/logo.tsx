import { cn } from "@/lib/utils";

const AstraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M5 22H19V20H5V22Z" />
    <path d="M6 19H18V9H6V19ZM8 17V11H10V17H8ZM11 17V11H13V17H11ZM14 17V11H16V17H14Z" />
    <path d="M4 8H20V6H4V8Z" />
    <path d="M3 5H21V3C21 2.44772 20.5523 2 20 2H4C3.44772 2 3 2.44772 3 3V5Z" />
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
