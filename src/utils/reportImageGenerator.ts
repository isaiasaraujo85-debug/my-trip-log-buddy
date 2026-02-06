import html2canvas from "html2canvas";
import { format } from "date-fns";

export type ImageFormat = "png" | "jpeg";

interface GenerateReportImageOptions {
  element: HTMLElement;
  format: ImageFormat;
  filename: string;
}

export async function generateReportImage({
  element,
  format: imageFormat,
  filename,
}: GenerateReportImageOptions): Promise<void> {
  try {
    // Generate canvas with 2x scale for clarity
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
    const quality = imageFormat === "jpeg" ? 0.92 : undefined;
    const extension = imageFormat === "png" ? "png" : "jpg";
    const dateStr = format(new Date(), "yyyyMMdd");
    const fullFilename = `${filename}-${dateStr}.${extension}`;

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        mimeType,
        quality
      );
    });

    // Try Web Share API first (for mobile sharing to WhatsApp, etc.)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fullFilename, { type: mimeType });
      const shareData = { files: [file] };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return; // Successfully shared
        } catch (err) {
          // User cancelled or share failed, fall back to download
          if ((err as Error).name !== "AbortError") {
            console.log("Share failed, falling back to download");
          }
        }
      }
    }

    // Fallback: Download the image
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating report image:", error);
    throw error;
  }
}
