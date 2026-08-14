import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";
import logoPaulistao from "@/assets/logo-paulistao.jpeg.asset.json";

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  return (
    <div className="flex flex-row items-center justify-start gap-3 p-2 mb-3 sm:mb-4 bg-muted/50 rounded-lg border w-full">
      <img
        src={empresaConfig.logoBase64 || logoPaulistao.url}
        alt="Logo Paulistão Atacadista"
        className="w-[120px] h-[60px] object-fill flex-shrink-0 rounded"
      />
      <div className="text-left flex flex-col justify-center">
        <h2 className="text-base sm:text-xl font-bold whitespace-nowrap">{empresaConfig.nome || "PAULISTÃO ATACADISTA"}</h2>
        <p className="text-sm sm:text-base font-bold text-muted-foreground whitespace-nowrap">Controle de Despesas</p>
      </div>
    </div>
  );
}
