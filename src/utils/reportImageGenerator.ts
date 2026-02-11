import html2canvas from "html2canvas";
import { format } from "date-fns";

export type ImageFormat = "png" | "jpeg";

interface GenerateReportImageOptions {
  element: HTMLElement;
  format: ImageFormat;
  filename: string;
}

async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Failed to create blob")),
      mimeType,
      quality
    );
  });
}

async function shareOrDownload(blob: Blob, filename: string, mimeType: string): Promise<void> {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: mimeType });
    const shareData = { files: [file] };
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.log("Share failed, falling back to download");
        }
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateReportImage({
  element,
  format: imageFormat,
  filename,
}: GenerateReportImageOptions): Promise<void> {
  try {
    const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
    const quality = imageFormat === "jpeg" ? 0.92 : undefined;
    const extension = imageFormat === "png" ? "png" : "jpg";
    const dateStr = format(new Date(), "yyyyMMdd");

    // Check if element has multiple child pages (direct child divs)
    const pages = element.querySelectorAll(':scope > div > div');
    
    if (pages.length > 1) {
      // Multi-page: generate one image per page
      const blobs: { blob: Blob; filename: string }[] = [];
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await captureElement(page);
        const blob = await canvasToBlob(canvas, mimeType, quality);
        const pageFilename = `${filename}-${dateStr}-p${i + 1}.${extension}`;
        blobs.push({ blob, filename: pageFilename });
      }

      // Try sharing all files at once
      if (navigator.share && navigator.canShare) {
        const files = blobs.map(b => new File([b.blob], b.filename, { type: mimeType }));
        const shareData = { files };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch (err) {
            if ((err as Error).name !== "AbortError") {
              console.log("Share failed, falling back to download");
            }
          }
        }
      }

      // Fallback: download each
      for (const { blob, filename: fname } of blobs) {
        await shareOrDownload(blob, fname, mimeType);
      }
    } else {
      // Single page
      const canvas = await captureElement(element);
      const fullFilename = `${filename}-${dateStr}.${extension}`;
      const blob = await canvasToBlob(canvas, mimeType, quality);
      await shareOrDownload(blob, fullFilename, mimeType);
    }
  } catch (error) {
    console.error("Error generating report image:", error);
    throw error;
  }
}
