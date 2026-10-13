import { isAxiosError } from "axios";

/** Every failed request is normalized to this, whatever the backend's error shape. */
export class HttpError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 when the request never got a response (offline, CORS, timeout). */
    readonly status: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Reads the backend's `{ message, errors? }` (or NestJS `message: string[]`) and the mock routes' `{ error }`. */
function messageFrom(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const { message, errors, error } = data as { message?: unknown; errors?: unknown; error?: unknown };
  if (Array.isArray(errors) && errors.length > 0) return errors.join("\n");
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string") return message;
  if (typeof error === "string") return error;
  return null;
}

export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (!isAxiosError(error)) return new HttpError(error instanceof Error ? error.message : "Something went wrong.", 0);
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return new HttpError("The request timed out. Please try again.", 0);
  if (!error.response) return new HttpError("Can't reach the server. Check your connection.", 0);
  const { status, data, statusText } = error.response;
  return new HttpError(messageFrom(data) ?? (statusText || "Something went wrong."), status, data);
}

/** Message to show in the UI for any thrown value. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
