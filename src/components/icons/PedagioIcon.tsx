interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function PedagioIcon({ className, strokeWidth = 1.6 }: IconProps) {
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
      <rect x="1.8" y="2.2" width="9.4" height="2.6" rx="0.7" />
      {/* Corpo da cabine */}
      <rect x="2.9" y="4.8" width="7.2" height="16.2" rx="0.6" />
      {/* Janela grande com guichê */}
      <path d="M4.4 6.6h4.2v5.4H4.4z" />
      <path d="M5.8 12v-1.6a0.9 0.9 0 0 1 1.8 0V12" />
      {/* Painel inferior com grade */}
      <rect x="4.4" y="14.2" width="4.2" height="3.4" rx="0.5" />
      <path d="M5.4 15.4h2.2M5.4 16.5h2.2" />
      {/* Poste da cancela */}
      <rect x="10.7" y="14.4" width="2.4" height="6.6" rx="0.6" />
      <circle cx="11.9" cy="16" r="0.5" fill="currentColor" stroke="none" />
      {/* Cancela inclinada listrada */}
      <path d="M12.9 15.1 21.2 3.4a1.1 1.1 0 0 1 1.8 1.3L14.7 16.4z" />
      <path d="M15.2 12.6 17 13.9M17.2 9.8 19 11.1M19.2 7 21 8.3" />
      {/* Chão */}
      <path d="M1 21.6h22" />
    </svg>
  );
}
