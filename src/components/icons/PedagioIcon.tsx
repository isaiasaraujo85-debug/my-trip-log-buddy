interface PedagioIconProps {
  className?: string;
  strokeWidth?: number;
}

export function PedagioIcon({ className, strokeWidth = 1.5 }: PedagioIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Cabine de pedágio */}
      <path d="M3 21V9l4-3 4 3v12" />
      <rect x="5" y="10.5" width="4" height="3.5" rx="0.5" />
      {/* Cancela */}
      <path d="M11 14h10" />
      <path d="M13 14v3M16 14v3M19 14v3" />
      <path d="M21 12v9" />
      <path d="M3 21h18" />
    </svg>
  );
}
