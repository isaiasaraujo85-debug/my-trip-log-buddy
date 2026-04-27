import { useRef } from "react";
import { Camera, Paperclip, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttachedImage } from "@/types";
import { toast } from "@/hooks/use-toast";

interface ImageAttachButtonProps {
  images: AttachedImage[];
  onImagesChange: (images: AttachedImage[]) => void;
  label?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(base64: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = base64;
  });
}

export function ImageAttachButton({ images, onImagesChange, label = "Imagem" }: ImageAttachButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newImages: AttachedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const base64 = await fileToBase64(files[i]);
      const resized = await resizeImage(base64);
      newImages.push({
        id: crypto.randomUUID(),
        base64: resized,
        timestamp: new Date().toISOString(),
      });
    }
    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const openCamera = async () => {
    // Verifica suporte e permissão antes de abrir
    try {
      if (typeof navigator !== "undefined" && (navigator as any).permissions?.query) {
        try {
          const status = await (navigator as any).permissions.query({ name: "camera" as PermissionName });
          if (status.state === "denied") {
            toast({
              title: "Acesso à câmera negado",
              description: "Habilite o acesso à câmera nas configurações do navegador para usar esta função.",
              variant: "destructive",
            });
            return;
          }
        } catch {
          // permission name não suportado em alguns navegadores - segue
        }
      }

      // Tenta solicitar permissão explicitamente para garantir prompt do SO
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
          });
          // Solta a stream imediatamente — usaremos o input file para captura
          stream.getTracks().forEach((t) => t.stop());
        } catch (err: any) {
          if (err?.name === "NotAllowedError") {
            toast({
              title: "Permissão negada",
              description: "Permita o acesso à câmera nas configurações do navegador.",
              variant: "destructive",
            });
            return;
          }
          if (err?.name === "NotFoundError") {
            toast({
              title: "Câmera não encontrada",
              description: "Nenhuma câmera disponível neste dispositivo.",
              variant: "destructive",
            });
            return;
          }
          // Outros erros: ainda tenta o input file (pode funcionar em iOS Safari)
        }
      }

      cameraInputRef.current?.click();
    } catch (err) {
      console.error("Erro ao abrir câmera:", err);
      toast({
        title: "Erro ao abrir a câmera",
        description: "Tente anexar uma imagem da galeria.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              {label}
              {images.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {images.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="mr-2 h-4 w-4" />
              Anexar Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Tirar Foto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative w-16 h-16">
              <img
                src={img.base64}
                alt="Anexo"
                className="w-full h-full object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
