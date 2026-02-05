import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  return (
    <div className="flex flex-row items-center justify-start gap-3 p-2 mb-3 sm:mb-4 bg-muted/50 rounded-lg border w-full">
      {empresaConfig.logoBase64 ? (
        <img 
          src={empresaConfig.logoBase64} 
          alt="Logo" 
          className="w-[120px] h-[60px] object-contain flex-shrink-0"
        />
      ) : (
        <div className="w-[120px] h-[60px] bg-primary rounded flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-lg">KM</span>
        </div>
      )}
      <div className="text-left flex flex-col justify-center">
        <h2 className="text-base sm:text-xl font-bold whitespace-nowrap">{empresaConfig.nome || "Sua Empresa"}</h2>
        <p className="text-sm sm:text-base font-bold text-muted-foreground whitespace-nowrap">Controle de Despesas</p>
      </div>
    </div>
  );
}
