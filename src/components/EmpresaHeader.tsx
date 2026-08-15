import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { EmpresaConfig } from "@/types";
import logoPaulistao from "@/assets/logo-paulistao.jpeg.asset.json";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function EmpresaHeader() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  const { saldo } = useFinanceiro();

  return (
    <div className="flex flex-row items-center justify-start gap-3 p-2 mb-3 sm:mb-4 bg-muted/50 rounded-lg border w-full">
      <img
        src={empresaConfig.logoBase64 || logoPaulistao.url}
        alt="Logo Paulistão Atacadista"
        className="w-[120px] h-[60px] object-fill flex-shrink-0 rounded"
      />
      <div className="text-left flex flex-col justify-center flex-1 min-w-0">
        <h2 className="text-base sm:text-xl font-bold whitespace-nowrap">{empresaConfig.nome || "PAULISTÃO ATACADISTA"}</h2>
        <p className="text-sm sm:text-base font-bold text-muted-foreground whitespace-nowrap">Controle de Despesas</p>
        <div className="flex justify-end">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block leading-none">Saldo</span>
            <span className={`text-sm sm:text-base font-bold ${saldo < 0 ? "text-destructive" : "text-blue-600"}`}>
              {formatCurrency(saldo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
