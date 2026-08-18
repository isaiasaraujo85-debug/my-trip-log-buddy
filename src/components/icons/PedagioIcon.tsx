interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function PedagioIcon({ className, strokeWidth = 1.8 }: IconProps) {
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
      <rect x="1.6" y="2.6" width="9.6" height="2.4" rx="0.5" />
      {/* Corpo da cabine */}
      <rect x="2.8" y="5" width="7.2" height="16" rx="0.5" />
      {/* Guichê */}
      <path d="M4.3 6.9h4.2v4.9H4.3z" />
      <path d="M5.7 11.8v-1.4a0.95 0.95 0 0 1 1.9 0v1.4" />
      {/* Painel inferior */}
      <rect x="4.3" y="13.9" width="4.2" height="3.4" rx="0.4" />
      <path d="M5.3 15.1h2.2M5.3 16.2h2.2" />
      {/* Base da cancela */}
      <rect x="10.7" y="14.6" width="2.5" height="6.4" rx="0.5" />
      <circle cx="11.95" cy="16.3" r="0.55" fill="currentColor" stroke="none" />
      {/* Cancela listrada inclinada */}
      <path d="M13.1 14.9 20.9 3.6a1.35 1.35 0 0 1 2.2 1.5L15.1 16.3z" />
      <path d="M14.9 12.9 17.1 14.4M16.7 10.2 18.9 11.8M18.5 7.6 20.7 9.1" />
      {/* Chão */}
      <path d="M0.9 21.4h22.2" />
    </svg>
  );
}
