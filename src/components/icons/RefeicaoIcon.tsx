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
      {/* Faca: lâmina + cabo */}
      <path d="M7 2c1.6 2.2 2.2 4.6 1.6 7.2l-.3 1.3H6.2l-.3-1.3C5.3 6.6 5.9 4.2 7 2Z" />
      <path d="M7 10.5v9.8a1.7 1.7 0 0 0 3.4 0" />
      {/* Garfo: 4 dentes + cabo */}
      <path d="M14 2v5.2M16.2 2v5.2M18.4 2v5.2" />
      <path d="M14 7.2c0 2 1.1 3.2 2.2 3.4 1.1-.2 2.2-1.4 2.2-3.4" />
      <path d="M16.2 10.6V22" />
    </svg>
  );
}
