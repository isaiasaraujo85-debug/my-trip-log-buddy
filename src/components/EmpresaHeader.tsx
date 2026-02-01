import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  if (!empresaConfig.nome && !empresaConfig.logoBase64) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 mb-4 bg-muted/50 rounded-lg border">
      {empresaConfig.logoBase64 ? (
        <img 
          src={empresaConfig.logoBase64} 
          alt="Logo" 
          className="w-12 h-12 object-contain"
        />
      ) : (
        <div className="w-12 h-12 bg-primary rounded flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">KM</span>
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold">{empresaConfig.nome || "KM Control"}</h2>
        <p className="text-xs text-muted-foreground">Controle de Despesas</p>
      </div>
    </div>
  );
}
