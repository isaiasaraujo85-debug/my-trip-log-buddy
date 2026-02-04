import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 mb-4 sm:mb-6 bg-muted/50 rounded-lg border">
      {empresaConfig.logoBase64 ? (
        <img 
          src={empresaConfig.logoBase64} 
          alt="Logo" 
          className="w-32 h-32 sm:w-[200px] sm:h-[200px] object-contain flex-shrink-0"
        />
      ) : (
        <div className="w-32 h-32 sm:w-[200px] sm:h-[200px] bg-primary rounded flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-3xl sm:text-4xl">KM</span>
        </div>
      )}
      <div className="text-center sm:text-left">
        <h2 className="text-lg sm:text-2xl font-bold whitespace-nowrap">{empresaConfig.nome || "Sua Empresa"}</h2>
        <p className="text-base sm:text-lg font-bold text-muted-foreground whitespace-nowrap">Controle de Despesas</p>
      </div>
    </div>
  );
}
