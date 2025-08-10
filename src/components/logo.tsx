import { cn } from "@/lib/utils";

const AstraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 160 200"
    role="img"
    aria-labelledby="title desc"
    {...props}
  >
    <title id="title">Greek pillar icon</title>
    <desc id="desc">
      Minimal Greek pillar / column with capital, fluted shaft, and base
    </desc>
    <g id="capital" transform="translate(0,6)">
      <rect x="18" y="6" width="124" height="12" rx="4" fill="currentColor" />
      <rect x="10" y="18" width="140" height="8" rx="3" fill="currentColor" />
      <rect x="28" y="26" width="104" height="4" rx="2" fill="currentColor" />
    </g>
    <g id="shaft" transform="translate(0,34)">
      <rect x="36" y="0" width="88" height="110" rx="6" fill="currentColor" />
      <path
        d="M56 6 C58 40, 58 80, 56 104"
        stroke="#ffffff22"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M80 6 C82 40, 82 80, 80 104"
        stroke="#ffffff22"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M104 6 C102 40, 102 80, 104 104"
        stroke="#ffffff22"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </g>
    <g id="base" transform="translate(0,146)">
      <rect x="8" y="0" width="144" height="12" rx="3" fill="currentColor" />
      <rect x="20" y="12" width="120" height="12" rx="3" fill="currentColor" />
      <rect x="32" y="24" width="96" height="10" rx="3" fill="currentColor" />
    </g>
    <path
      d="M36 34 h88 v110 h-88 z"
      fill="none"
      stroke="#071428"
      strokeOpacity="0.12"
      strokeWidth="2"
      rx="6"
    />
  </svg>
);


export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
        <AstraIcon className="h-full w-auto text-current"/>
        <span className="text-2xl font-bold font-serif text-current">
            Astra
        </span>
    </div>
  );
}
