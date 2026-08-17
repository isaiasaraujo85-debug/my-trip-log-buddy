interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function PedagioIcon({ className, strokeWidth = 1.5 }: IconProps) {
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
      {/* Telhado da cabine */}
      <rect x="2.5" y="2.5" width="9" height="2.5" rx="0.6" />
      {/* Corpo da cabine */}
      <path d="M3.5 5v16h7V5" />
      {/* Janela */}
      <rect x="5" y="7" width="4" height="4.5" rx="0.6" />
      {/* Painel inferior com linhas */}
      <rect x="5" y="14" width="4" height="3.5" rx="0.6" />
      <path d="M6 15.4h2M6 16.6h2" />
      {/* Cancela inclinada */}
      <path d="M11.5 17.5 21 5.5" />
      <path d="M13.6 14.8l1.8 1.4M15.9 11.9l1.8 1.4M18.2 9l1.8 1.4" />
      {/* Base da cancela */}
      <path d="M11.5 17.5V21" />
      <path d="M2 21h20" />
    </svg>
  );
}
