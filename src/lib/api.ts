// src/lib/api.ts

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // ex: http://127.0.0.1:8000/api/v1
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Json = unknown;

interface RequestOptions {
  method?: HttpMethod;
  body?: Json;
}

function ensureBase() {
  if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL mangler i .env.local");
}

function buildHeaders(method: HttpMethod): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (method !== "GET") headers["Content-Type"] = "application/json";
  if (TOKEN && TOKEN.trim()) headers["Authorization"] = `Bearer ${TOKEN}`;
  return headers;
}

export async function apiRequest<T>(path: string, opts?: RequestOptions): Promise<T> {
  ensureBase();
  const method: HttpMethod = opts?.method ?? "GET";
  const url = `${BASE}${path}`;
  const headers = buildHeaders(method);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[apiRequest]", method, url);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
      next: { revalidate: method === "GET" ? 30 : 0 },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(`Klarte ikke å nå API (${url}). ${msg}`, 0);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let errors: Record<string, string[]> | undefined;
    try {
      const json = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
      if (json?.message) message += ` – ${json.message}`;
      if (json?.errors) errors = json.errors;
    } catch { /* no-op */ }
    throw new ApiError(message, res.status, errors);
  }

  return (await res.json()) as T;
}