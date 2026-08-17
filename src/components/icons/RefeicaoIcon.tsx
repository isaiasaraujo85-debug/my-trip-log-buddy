interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function RefeicaoIcon({ className, strokeWidth = 1.5 }: IconProps) {
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
      {/* Faca */}
      <path d="M6.5 2c1.4 1.8 1.9 4 1.6 6.3l-.3 2.2H5.2l-.3-2.2C4.6 6 5.1 3.8 6.5 2Z" />
      <path d="M6.5 10.5V22" />
      {/* Garfo */}
      <path d="M14 2v5M17 2v5M20 2v5" />
      <path d="M14 7c0 1.9 1.3 3.2 3 3.4 1.7-.2 3-1.5 3-3.4" />
      <path d="M17 10.4V22" />
    </svg>
  );
}
