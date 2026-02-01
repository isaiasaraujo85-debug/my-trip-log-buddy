import { Car } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-primary rounded-lg flex items-center justify-center`}>
        <Car className="text-primary-foreground h-2/3 w-2/3" />
      </div>
      <div className="flex flex-col">
        <span className={`${textClasses[size]} font-bold text-foreground`}>
          KM Control
        </span>
        <span className="text-xs text-muted-foreground">
          Controle de Despesas
        </span>
      </div>
    </div>
  );
}
