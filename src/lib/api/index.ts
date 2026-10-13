import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { client } from "./client";

export { setApiToken, setUnauthorizedHandler } from "./client";
export { getErrorMessage, HttpError } from "./error";

export interface ApiResult<T> {
  data: T;
  /** The backend's success message, for toasts; null when it sent none. */
  message: string | null;
}

/** Keeps the success message alongside the body: `client.post<T>(...).then(withMessage)`. */
export function withMessage<T>(response: AxiosResponse<T>): ApiResult<T> {
  return { data: response.data, message: response.message ?? null };
}

export { client } from "./client";

/** Typed request helpers that resolve to the response body. Failures reject with HttpError. */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => client.get<T>(url, config).then((r) => r.data),
  post: <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig) => client.post<T>(url, body, config).then((r) => r.data),
  put: <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig) => client.put<T>(url, body, config).then((r) => r.data),
  patch: <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig) => client.patch<T>(url, body, config).then((r) => r.data),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => client.delete<T>(url, config).then((r) => r.data),
};
