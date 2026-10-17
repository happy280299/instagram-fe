import axios from "axios";
import type { ApiSuccess } from "@/types";
import { toHttpError } from "./error";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    /** Already re-sent once with a refreshed token. */
    _retried?: boolean;
  }
  interface AxiosResponse {
    /** The backend envelope's `message` (e.g. "Login success"); absent for bare mock responses. */
    message?: string;
    /** The backend envelope's `meta` (pagination info on list endpoints). */
    meta?: unknown;
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
let refresher: ((staleToken: string) => Promise<string | null>) | null = null;
let refreshing: Promise<string | null> | null = null;

/** Called by the auth store so every request carries the Bearer token. */
export function setApiToken(value: string | null) {
  token = value;
}

/** Called by the auth store to log out when the backend rejects the token. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/**
 * Called by the auth store. On a 401 the client asks it for a fresh access token (or null when the
 * session is over), then re-sends the request. It may throw on a network error: no logout then.
 */
export function setTokenRefresher(fn: ((staleToken: string) => Promise<string | null>) | null) {
  refresher = fn;
}

/** One refresh at a time: requests that fail together wait for the same one. */
function refreshOnce(staleToken: string) {
  refreshing ??= (refresher ? refresher(staleToken) : Promise.resolve(null)).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Their 401 means wrong credentials or a dead refresh token, not an expired access token. */
const NO_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

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
  async (error: unknown) => {
    const httpError = toHttpError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const sentToken = token;
    if (httpError.status !== 401 || !sentToken || !config || NO_REFRESH.some((path) => (config.url ?? "").includes(path))) {
      return Promise.reject(httpError);
    }
    if (config._retried) {
      onUnauthorized?.();
      return Promise.reject(httpError);
    }
    let fresh: string | null;
    try {
      fresh = await refreshOnce(sentToken);
    } catch {
      // Couldn't reach the server to refresh: report this request's failure, keep the session.
      return Promise.reject(httpError);
    }
    if (!fresh) {
      onUnauthorized?.();
      return Promise.reject(httpError);
    }
    config._retried = true;
    config.headers.Authorization = `Bearer ${fresh}`;
    return client(config);
  },
);
