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
      {/* Faca cruzada (inclinada para a esquerda) */}
      <g transform="rotate(-40 12 12)">
        <path d="M11.1 1.9c1.7 2.6 2.3 5.3 1.8 8.1h-3.3c-.5-2.8.1-5.5 1.5-8.1Z" />
        <path d="M9.9 11.2h2.8l-.4 9.4a1.05 1.05 0 0 1-2.1 0z" />
      </g>
      {/* Garfo cruzado (inclinado para a direita) */}
      <g transform="rotate(40 12 12)">
        <path d="M9.6 2h1.1v5.4H9.6zM11.5 2h1.1v5.4h-1.1zM13.4 2h1.1v5.4h-1.1z" />
        <path d="M9.1 7.9h6v.4c0 1.8-1 3-2.2 3.4v1.2h-1.7v-1.2c-1.2-.4-2.1-1.6-2.1-3.4z" />
        <path d="M11.2 13.6h1.8l-.3 7a.6.6 0 0 1-1.2 0z" />
      </g>
    </svg>
  );
}
