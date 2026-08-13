import { Car, Receipt, Utensils, UserPlus, Settings, Bus, BedDouble } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KmTab } from "@/components/KmTab";
import { PedagioTab } from "@/components/PedagioTab";
import { RefeicaoTab } from "@/components/RefeicaoTab";
import { TransporteTab } from "@/components/TransporteTab";
import { HospedagemTab } from "@/components/HospedagemTab";
import { CadastroTab } from "@/components/CadastroTab";
import { ConfiguracaoTab } from "@/components/ConfiguracaoTab";
import { EmpresaHeader } from "@/components/EmpresaHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container px-2 sm:px-4 py-3 sm:py-6 max-w-lg mx-auto">
        <EmpresaHeader />
        
        <Tabs defaultValue="km" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-3 h-11">
            <TabsTrigger value="km" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-1 text-[10px] sm:text-sm">
              <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>KM</span>
            </TabsTrigger>
            <TabsTrigger value="pedagio" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Pedágio</span>
            </TabsTrigger>
            <TabsTrigger value="refeicao" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Refeição</span>
            </TabsTrigger>
            <TabsTrigger value="transporte" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <Bus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Transp.</span>
            </TabsTrigger>
            <TabsTrigger value="hospedagem" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <BedDouble className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Hosped.</span>
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Cadastro</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 px-0.5 text-[9px] sm:text-sm">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="km"><KmTab /></TabsContent>
          <TabsContent value="pedagio"><PedagioTab /></TabsContent>
          <TabsContent value="refeicao"><RefeicaoTab /></TabsContent>
          <TabsContent value="transporte"><TransporteTab /></TabsContent>
          <TabsContent value="hospedagem"><HospedagemTab /></TabsContent>
          <TabsContent value="cadastro"><CadastroTab /></TabsContent>
          <TabsContent value="config"><ConfiguracaoTab /></TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-3">
        <div className="container px-4 text-center text-xs text-muted-foreground">
          Aplicativo desenvolvido por Isaias Araujo
        </div>
      </footer>
    </div>
  );
};

export default Index;
