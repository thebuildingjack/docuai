import { NextResponse } from "next/server";

/** Map of internal error codes → user-facing messages + HTTP status */
const ERROR_MAP: Record<string, { message: string; status: number }> = {
  UNAUTHORIZED: { message: "Authentication required.", status: 401 },
  FORBIDDEN: { message: "You do not have access to this resource.", status: 403 },
  NOT_FOUND: { message: "Resource not found.", status: 404 },
  USER_NOT_FOUND: { message: "User account not found.", status: 404 },
  PDF_PARSE_FAILED: {
    message: "Could not parse the PDF file. Ensure it is a valid PDF.",
    status: 422,
  },
  PDF_NO_TEXT: {
    message:
      "The PDF does not contain extractable text. Scanned image PDFs are not supported.",
    status: 422,
  },
  FILE_TOO_LARGE: {
    message: `File exceeds the maximum allowed size.`,
    status: 413,
  },
  INVALID_FILE_TYPE: {
    message: "Only PDF files are accepted.",
    status: 415,
  },
  RATE_LIMITED: {
    message: "You are sending messages too quickly. Please slow down.",
    status: 429,
  },
  AI_FAILED: {
    message: "AI processing failed. Please try again.",
    status: 502,
  },
  VALIDATION_ERROR: { message: "Invalid request data.", status: 400 },
};

/**
 * Convert any error into a safe, user-facing JSON response.
 * Never exposes stack traces or internal details.
 */
export function safeError(err: unknown): NextResponse {
  // Log for server-side debugging (sanitized)
  if (err instanceof Error) {
    const code = err.message;
    const mapped = ERROR_MAP[code];

    if (mapped) {
      return NextResponse.json(
        { error: mapped.message, code },
        { status: mapped.status }
      );
    }

    // Unknown error — log it but hide details from client
    console.error("[DocuAI] Unhandled error:", err.message);
  } else {
    console.error("[DocuAI] Unknown error type:", typeof err);
  }

  return NextResponse.json(
    { error: "An unexpected error occurred. Please try again." },
    { status: 500 }
  );
}

/** Throw a named error that safeError knows how to handle */
export function throwSafe(code: keyof typeof ERROR_MAP): never {
  throw new Error(code);
}
