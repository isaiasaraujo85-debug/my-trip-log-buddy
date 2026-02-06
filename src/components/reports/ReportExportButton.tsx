import { useState, useRef, ReactNode } from "react";
import { Image, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateReportImage, ImageFormat } from "@/utils/reportImageGenerator";
import { useToast } from "@/hooks/use-toast";

interface ReportExportButtonProps {
  children: ReactNode;
  filename: string;
  disabled?: boolean;
}

export function ReportExportButton({ children, filename, disabled }: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExport = async (format: ImageFormat) => {
    if (!containerRef.current) return;

    setIsGenerating(true);
    try {
      await generateReportImage({
        element: containerRef.current,
        format,
        filename,
      });
      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden container for report rendering */}
      <div 
        ref={containerRef} 
        className="fixed left-[-9999px] top-0"
        aria-hidden="true"
      >
        {children}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Gerando...
              </>
            ) : (
              <>
                <Image className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("png")}>
            <Download className="mr-2 h-4 w-4" />
            Baixar como PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("jpeg")}>
            <Download className="mr-2 h-4 w-4" />
            Baixar como JPEG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
