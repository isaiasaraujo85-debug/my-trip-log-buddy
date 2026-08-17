interface IconProps {
  className?: string;
  strokeWidth?: number | string;
}

export function HospedagemIcon({ className, strokeWidth = 1.5 }: IconProps) {
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
      {/* Letreiro no topo */}
      <rect x="7" y="1.5" width="10" height="3" rx="0.5" />
      <path d="M10 4.5v1.5M14 4.5v1.5" />
      {/* Marquise */}
      <path d="M3.5 6h17v1.8L19 9.5H5L3.5 7.8V6Z" />
      {/* Corpo do prédio */}
      <path d="M5.5 9.5V21M18.5 9.5V21" />
      {/* Janelas */}
      <path d="M8 12h.01M11 12h.01M14 12h.01M16 12h.01M8 15h.01M11 15h.01M14 15h.01M16 15h.01" />
      {/* Entrada */}
      <path d="M10 21v-3.5h4V21" />
      <path d="M2 21h20" />
    </svg>
  );
}
