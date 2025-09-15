export default function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* Ytre sirkel (stoppeklokke) */}
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Toppknapp på klokka */}
      <rect x="28" y="8" width="8" height="6" rx="2" fill="currentColor" />
      {/* Viser / tid */}
      <path d="M32 32 L46 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Bane-kurve (quarter track) */}
      <path
        d="M14 44c0-10 8-18 18-18s18 8 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}