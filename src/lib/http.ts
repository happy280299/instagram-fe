import { NextResponse } from "next/server";
import type { ApiError } from "@/types";

/** Simulates 300–800ms network latency so skeletons are visible. */
export function simulateLatency(min = 300, max = 800): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<T>(data, init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json<ApiError>({ error }, { status });
}

export function pageParams(request: Request, defaultLimit: number) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || defaultLimit, 1), 50);
  return { cursor: searchParams.get("cursor"), limit, searchParams };
}

/** The mock "auth" header sent by the client api helper. */
export function viewerId(request: Request, fallback: string): string {
  return request.headers.get("x-viewer-id") ?? fallback;
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {};
  }
}
