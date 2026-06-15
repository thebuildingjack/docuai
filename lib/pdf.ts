/**
 * Server-side PDF text extraction using pdf-parse.
 * Never import this file in client components.
 */

const MAX_RAWTEXT_CHARS = parseInt(
  process.env.DOCUAI_MAX_RAWTEXT_CHARS ?? "200000",
  10
);

/**
 * Check if the buffer starts with PDF magic bytes (%PDF).
 */
export function isPdfMagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 //   F
  );
}

export interface ExtractResult {
  text: string;
  truncated: boolean;
  numPages: number;
}

/**
 * Extract text from a PDF buffer.
 * Truncates at MAX_RAWTEXT_CHARS to avoid sending excessive tokens to Claude.
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<ExtractResult> {
  // Dynamic import to avoid bundling issues with Next.js
  const pdfParse = (await import("pdf-parse")).default;

  let data: Awaited<ReturnType<typeof pdfParse>>;
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    throw new Error("PDF_PARSE_FAILED");
  }

  const rawText = data.text?.trim() ?? "";

  if (!rawText) {
    throw new Error("PDF_NO_TEXT");
  }

  const truncated = rawText.length > MAX_RAWTEXT_CHARS;
  const text = truncated ? rawText.slice(0, MAX_RAWTEXT_CHARS) : rawText;

  return {
    text,
    truncated,
    numPages: data.numpages ?? 0,
  };
}

/**
 * Get a relevant excerpt from the raw text for chat grounding.
 * Simple approach: use beginning + end to stay within token limits.
 * For production, consider embeddings-based retrieval.
 */
export function getRelevantExcerpt(
  rawText: string,
  maxChars = 12000
): string {
  if (rawText.length <= maxChars) return rawText;

  const half = Math.floor(maxChars / 2);
  const start = rawText.slice(0, half);
  const end = rawText.slice(-half);
  return `${start}\n\n[... content truncated for context window ...]\n\n${end}`;
}
