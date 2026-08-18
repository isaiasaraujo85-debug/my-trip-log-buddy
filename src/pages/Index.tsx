import { useState } from "react";
import { Gauge, IdCard, CarTaxiFront, Wallet, ArrowLeft } from "lucide-react";
import { PedagioIcon } from "@/components/icons/PedagioIcon";
import { RefeicaoIcon } from "@/components/icons/RefeicaoIcon";
import { HospedagemIcon } from "@/components/icons/HospedagemIcon";
import { Button } from "@/components/ui/button";
import { KmTab } from "@/components/KmTab";
import { PedagioTab } from "@/components/PedagioTab";
import { RefeicaoTab } from "@/components/RefeicaoTab";
import { TransporteTab } from "@/components/TransporteTab";
import { HospedagemTab } from "@/components/HospedagemTab";
import { CadastroTab } from "@/components/CadastroTab";
import { FinanceiroTab } from "@/components/FinanceiroTab";
import { EmpresaHeader } from "@/components/EmpresaHeader";

type MenuKey = "km" | "pedagio" | "hospedagem" | "refeicao" | "transporte" | "cadastro" | "financeiro";

const menus: { key: MenuKey; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }> }[] = [
  { key: "km", label: "KM", icon: Gauge },
  { key: "pedagio", label: "Pedágio", icon: PedagioIcon },
  { key: "hospedagem", label: "Hospedagem", icon: HospedagemIcon },
  { key: "refeicao", label: "Refeição", icon: RefeicaoIcon },
  { key: "transporte", label: "Transporte", icon: CarTaxiFront },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "cadastro", label: "Cadastro", icon: IdCard },
];


const views: Record<MenuKey, JSX.Element> = {
  km: <KmTab />,
  pedagio: <PedagioTab />,
  hospedagem: <HospedagemTab />,
  refeicao: <RefeicaoTab />,
  transporte: <TransporteTab />,
  cadastro: <CadastroTab />,
  financeiro: <FinanceiroTab />,
};

const Index = () => {
  const [active, setActive] = useState<MenuKey | null>(null);
  const activeMenu = menus.find((m) => m.key === active);

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-2 sm:px-4 py-3 sm:py-6 max-w-lg mx-auto">
        <EmpresaHeader />

        {active === null ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {menus.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground active:bg-accent focus-visible:bg-accent transition-colors shadow-sm p-4"
              >
                <Icon className="h-16 w-16 sm:h-20 sm:w-20 text-primary" strokeWidth={1.5} />
                <span className="text-sm sm:text-base font-bold uppercase text-center">{label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setActive(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <h1 className="text-base font-bold uppercase">{activeMenu?.label}</h1>
            </div>
            {views[active]}
          </div>
        )}
      </main>

      <footer className="border-t py-3">
        <div className="container px-4 text-center text-xs text-muted-foreground">
          Aplicativo desenvolvido por Isaias de Araujo 08/2026
        </div>
      </footer>
    </div>
  );
};

export default Index;
