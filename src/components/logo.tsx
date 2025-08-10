import { cn } from "@/lib/utils";

const AstraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2L0 22H4.5L12 7.5L19.5 22H24L12 2ZM12 11.5L10.5 16H13.5L12 11.5Z" />
    <path d="M12 13.25L11.5 14.5L12 15.75L12.5 14.5L12 13.25Z" />
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
