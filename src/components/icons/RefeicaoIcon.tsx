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
      {/* Faca: lâmina larga + cabo */}
      <path d="M5.6 2.3c1.9 2.6 2.6 5.3 2.1 8.1l-.2 1.1H4.9l-.2-1.1C4.2 7.6 4.6 4.9 5.6 2.3Z" />
      <path d="M4.7 12.6h3.1v6.9a1.55 1.55 0 0 1-3.1 0z" />
      {/* Garfo: 4 dentes + base + cabo */}
      <path d="M12.6 2.2h1.25v6.1H12.6zM15 2.2h1.25v6.1H15zM17.4 2.2h1.25v6.1H17.4z" />
      <path d="M11.9 8.6h7.6c0 2.5-1.3 4.1-2.85 4.5V21.6a0.95 0.95 0 0 1-1.9 0V13.1C13.2 12.7 11.9 11.1 11.9 8.6Z" />
    </svg>
  );
}
