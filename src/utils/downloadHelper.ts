/**
 * Download helper compatível com Android WebView (APK) e navegadores.
 *
 * Estratégia:
 * 1. Tenta Web Share API (melhor experiência em mobile/WebView)
 * 2. Tenta âncora <a download> com data URL base64 (funciona em WebView moderno)
 * 3. Fallback: window.location.href = base64Data
 */

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function downloadBase64(
  base64Data: string,
  filename: string,
  mimeType: string
): Promise<void> {
  // Garante que é um data URL completo
  const dataUrl = base64Data.startsWith("data:")
    ? base64Data
    : `data:${mimeType};base64,${base64Data}`;

  // 1) Web Share API (ideal em Android via Capacitor/WebView com File API)
  try {
    if (typeof navigator !== "undefined" && (navigator as any).canShare) {
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], filename, { type: mimeType });
      const shareData = { files: [file], title: filename } as any;
      if ((navigator as any).canShare(shareData)) {
        await (navigator as any).share(shareData);
        return;
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.warn("Web Share falhou, tentando download direto", err);
    } else {
      return;
    }
  }

  // 2) Âncora <a download> com data URL — funciona em Chrome e WebView moderno
  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  } catch (err) {
    console.warn("Download via <a> falhou, usando window.location.href", err);
  }

  // 3) Fallback final: navegação direta para o data URL (WebView legado)
  try {
    window.location.href = dataUrl;
  } catch (err) {
    console.error("Falha ao baixar arquivo", err);
    throw err;
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function downloadBlob(
  blob: Blob,
  filename: string
): Promise<void> {
  const dataUrl = await blobToBase64(blob);
  await downloadBase64(dataUrl, filename, blob.type);
}