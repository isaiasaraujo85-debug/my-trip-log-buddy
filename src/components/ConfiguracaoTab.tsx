import { useState, useRef } from "react";
import { Settings, Upload, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EmpresaConfig } from "@/types";

export function ConfiguracaoTab() {
  const { toast } = useToast();
  const [empresaConfig, setEmpresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [nome, setNome] = useState(empresaConfig.nome);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(empresaConfig.logoBase64);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 500KB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const config: EmpresaConfig = {
      nome,
      logoBase64: logoPreview
    };
    
    setEmpresaConfig(config);
    
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!"
    });
  };

  const handleRemoveLogo = () => {
    setLogoPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="empresa-nome">Nome da Empresa</Label>
            <Input
              id="empresa-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="space-y-4">
            <Label>Logo da Empresa</Label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar Logo
                </Button>
                {logoPreview && (
                  <Button
                    variant="ghost"
                    onClick={handleRemoveLogo}
                    className="text-destructive"
                  >
                    Remover Logo
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  Formatos: JPG, PNG. Máx: 500KB
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">KM</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{nome || "Nome da Empresa"}</h2>
              <p className="text-sm text-muted-foreground">Controle de Despesas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
