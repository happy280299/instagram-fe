import axios from "axios";
import type { ApiSuccess } from "@/types";
import { toHttpError } from "./error";

declare module "axios" {
  interface AxiosResponse {
    /** The backend envelope's `message` (e.g. "Login success"); absent for bare mock responses. */
    message?: string;
    /** The backend envelope's `meta` (pagination info on list endpoints). */
    meta?: unknown;
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called by the auth store so every request carries the Bearer token. */
export function setApiToken(value: string | null) {
  token = value;
}

/** Called by the auth store to log out when the backend rejects the token. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function isEnvelope(body: unknown): body is ApiSuccess<unknown> {
  return typeof body === "object" && body !== null && (body as ApiSuccess<unknown>).success === true && "data" in body;
}

client.interceptors.response.use(
  // The backend wraps bodies in `{ success, data }`; the mock /api routes return them bare.
  (response) => {
    if (isEnvelope(response.data)) {
      response.message = response.data.message;
      response.meta = response.data.meta;
      response.data = response.data.data;
    }
    return response;
  },
  (error: unknown) => {
    const httpError = toHttpError(error);
    // A 401 from /auth/* means bad credentials, not an expired session.
    const url = axios.isAxiosError(error) ? (error.config?.url ?? "") : "";
    if (httpError.status === 401 && token && !url.includes("/auth/")) onUnauthorized?.();
    return Promise.reject(httpError);
  },
);
