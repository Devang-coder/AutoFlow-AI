import Tesseract from "tesseract.js";

export type OcrQuality = "GOOD" | "FAIR" | "POOR";

export function getOcrQuality(text: string): OcrQuality {
  const len = text.trim().length;
  if (len > 200) return "GOOD";
  if (len >= 50) return "FAIR";
  return "POOR";
}

export async function runOcrOnImage(imageSource: File | string | Blob): Promise<string> {
  const result = await Tesseract.recognize(imageSource, "eng", {
    logger: () => {},
  });
  return result.data.text;
}

export async function runOcrOnPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    const text = await runOcrOnImage(blob);
    pageTexts.push(text);
  }

  return pageTexts.join("\n\n");
}

export async function extractTextFromFile(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return runOcrOnPdf(file);
  }
  return runOcrOnImage(file);
}
