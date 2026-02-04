import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-2 p-2 mb-3 sm:mb-4 bg-muted/50 rounded-lg border">
      {empresaConfig.logoBase64 ? (
        <img 
          src={empresaConfig.logoBase64} 
          alt="Logo" 
          className="w-24 h-24 sm:w-[150px] sm:h-[150px] object-contain flex-shrink-0"
        />
      ) : (
        <div className="w-24 h-24 sm:w-[150px] sm:h-[150px] bg-primary rounded flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-2xl sm:text-3xl">KM</span>
        </div>
      )}
      <div className="text-center sm:text-left">
        <h2 className="text-base sm:text-xl font-bold whitespace-nowrap">{empresaConfig.nome || "Sua Empresa"}</h2>
        <p className="text-sm sm:text-base font-bold text-muted-foreground whitespace-nowrap">Controle de Despesas</p>
      </div>
    </div>
  );
}
