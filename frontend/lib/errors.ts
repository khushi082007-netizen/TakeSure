import type { ApiError } from "@/types/api";

export interface ErrorPresentation {
  title: string;
  body: string;
  /** What the user can do next. */
  suggestion?: string;
  retryable: boolean;
  /** Offer the manual-entry fallback. */
  offerManual?: boolean;
}

/** Human-readable, actionable copy for every backend error code. Never a bare "something went wrong". */
export function presentError(e: Pick<ApiError, "code" | "message" | "retryable" | "detail">): ErrorPresentation {
  switch (e.code) {
    case "UNSUPPORTED_FILE":
      return { title: "File type not supported", body: e.message, suggestion: "Upload a JPG, PNG, WebP or PDF, or type the names manually.", retryable: false, offerManual: true };
    case "FILE_TOO_LARGE":
      return { title: "File is too large", body: e.message, suggestion: "Take a smaller photo or compress the image, then try again.", retryable: false, offerManual: true };
    case "UPLOAD_NOT_FOUND":
      return { title: "Upload expired", body: "Uploaded files are kept for a few minutes only, for your privacy.", suggestion: "Please upload the photo again.", retryable: false };
    case "OCR_UNAVAILABLE":
      return { title: "Document reader is not available", body: e.message, suggestion: "You can still type the medicine and product names manually.", retryable: true, offerManual: true };
    case "OCR_FAILED":
      return { title: "Could not read the document", body: e.message, suggestion: "Try a sharper, well-lit photo, or enter the names manually.", retryable: true, offerManual: true };
    case "NO_TEXT_DETECTED":
      return { title: "No readable text found", body: "The photo did not contain text we could read.", suggestion: "Hold the camera closer to the printed names, or type them manually.", retryable: true, offerManual: true };
    case "VALIDATION_FAILED":
      return { title: "Some details are missing or invalid", body: e.message, suggestion: "Check the highlighted fields and try again.", retryable: false };
    case "RATE_LIMITED":
      return { title: "Too many requests", body: e.message, suggestion: "Wait a minute and try again.", retryable: true };
    case "DATABASE_UNAVAILABLE":
      return { title: "Knowledge base is temporarily unavailable", body: e.message, suggestion: "Try again in a moment. No verdict is shown without the knowledge base.", retryable: true };
    case "PDF_GENERATION_FAILED":
      return { title: "PDF could not be generated", body: e.message, suggestion: "Try again. Your result is still shown on screen.", retryable: true };
    case "NETWORK_ERROR":
      return { title: "Cannot reach the server", body: e.message, suggestion: "Check your connection and that the backend is running.", retryable: true };
    case "TIMEOUT":
      return { title: "Request timed out", body: e.message, suggestion: "Document reading can be slow on the first run. Try again or use manual entry.", retryable: true, offerManual: true };
    case "NOT_FOUND":
      return { title: "Not found", body: e.message, retryable: false };
    case "INVALID_RESPONSE":
      return { title: "Unexpected response", body: e.message, suggestion: "Please retry.", retryable: true };
    default:
      return { title: "An error occurred", body: e.message || "The server reported an internal error.", suggestion: "Please retry. If this keeps happening, use the feedback link.", retryable: true };
  }
}
