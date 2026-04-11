import { useState, useRef, ReactNode } from "react";
import { Image, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateReportImage, ImageFormat } from "@/utils/reportImageGenerator";

interface ReportExportButtonProps {
  children: ReactNode;
  filename: string;
  disabled?: boolean;
  onGeneratePdf?: () => void;
}

export function ReportExportButton({ children, filename, disabled, onGeneratePdf }: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ImageFormat) => {
    if (!containerRef.current) return;

    setIsGenerating(true);
    try {
      await generateReportImage({
        element: containerRef.current,
        format,
        filename,
      });
    } catch (error) {
      console.error("Falha ao gerar relatório", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePdf = () => {
    if (onGeneratePdf) {
      onGeneratePdf();
    }
  };

  return (
    <>
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
          {onGeneratePdf && (
            <DropdownMenuItem onClick={handlePdf}>
              <FileText className="mr-2 h-4 w-4" />
              Baixar como PDF
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
