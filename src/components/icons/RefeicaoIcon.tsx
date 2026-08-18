interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function RefeicaoIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Faca: lâmina + cabo com interrupção */}
      <path d="M6.1 1.6c1.9 3 2.5 6 1.9 9.1H4.2C3.6 7.6 4.2 4.6 6.1 1.6Z" />
      <path d="M4.4 12.2h3.4v2.1H4.4z" />
      <path d="M4.4 15.8h3.4v5.1a1.7 1.7 0 0 1-3.4 0z" />
      {/* Garfo: 4 dentes */}
      <path d="M11.6 1.6h1.3v6.5h-1.3zM14 1.6h1.3v6.5H14zM16.4 1.6h1.3v6.5h-1.3zM18.8 1.6h1.3v6.5h-1.3z" />
      {/* Corpo do garfo com interrupção no cabo */}
      <path d="M11 8.6h9.7c0 2.7-1.5 4.4-3.2 4.8v1.2h-3.3v-1.2C12.5 13 11 11.3 11 8.6Z" />
      <path d="M14.2 15.8h3.3v5.1a1.65 1.65 0 0 1-3.3 0z" />
    </svg>
  );
}
