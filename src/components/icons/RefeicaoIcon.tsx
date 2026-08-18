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
      {/* Faca inclinada (da esquerda-baixo para direita-topo) */}
      <path d="M19.9 2.6c.5.5.5 1.3 0 1.8l-6.6 6.6-2-1.8 6.8-6.7c.5-.5 1.3-.5 1.8.1Z" />
      <path d="M11.6 10.4 3.6 18.4a1.5 1.5 0 0 0 2.1 2.1l7.9-8.1z" />
      {/* Garfo inclinado (da direita-topo para esquerda-baixo) */}
      <path d="M17.4 3.1a.7.7 0 0 1 1 1l-2.5 2.6-.9-.9zM19.6 5.3a.7.7 0 0 1 1 1L18.1 9l-.9-1zM18.6 4.1l1.1 1.1-2.6 2.6-1-1z" />
      <path d="M15.6 7.5c-1 1-1.2 2.4-.6 3.5l-1 1 2.4 2.4 1-1c1.1.5 2.5.3 3.5-.7l-5.3-5.2Z" />
      <path d="M13.9 12.4 5.9 20.4a1.5 1.5 0 0 1-2.1-2.1l8-8z" opacity="0" />
      <path d="M14.7 12.7 6.6 20.9a1.5 1.5 0 0 0 2.2 2.1l-.1-.1 8-8.1z" opacity="0" />
      <path d="M15.5 13.5 8.1 20.9a1.5 1.5 0 0 1-2.1-2.1l7.4-7.4z" />
    </svg>
  );
}
