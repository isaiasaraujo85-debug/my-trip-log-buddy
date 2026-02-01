import { Car, Receipt, Utensils } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { KmTab } from "@/components/KmTab";
import { PedagioTab } from "@/components/PedagioTab";
import { RefeicaoTab } from "@/components/RefeicaoTab";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <Tabs defaultValue="km" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="km" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">KM</span>
            </TabsTrigger>
            <TabsTrigger value="pedagio" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Pedágio</span>
            </TabsTrigger>
            <TabsTrigger value="refeicao" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Refeição</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="km">
            <KmTab />
          </TabsContent>

          <TabsContent value="pedagio">
            <PedagioTab />
          </TabsContent>

          <TabsContent value="refeicao">
            <RefeicaoTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          KM Control © {new Date().getFullYear()} - Todos os dados salvos localmente
        </div>
      </footer>
    </div>
  );
};

export default Index;
