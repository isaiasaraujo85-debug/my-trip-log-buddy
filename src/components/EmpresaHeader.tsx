import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  return (
    <div className="flex items-center gap-4 p-4 mb-4 bg-muted/50 rounded-lg border">
      {empresaConfig.logoBase64 ? (
        <img 
          src={empresaConfig.logoBase64} 
          alt="Logo" 
          className="w-16 h-16 object-contain"
        />
      ) : (
        <div className="w-16 h-16 bg-primary rounded flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">KM</span>
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold">{empresaConfig.nome || "Sua Empresa"}</h2>
        <p className="text-base font-bold text-muted-foreground">Controle de Despesas</p>
      </div>
    </div>
  );
}
