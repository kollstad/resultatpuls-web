// Brukes for "menneskeinnlogging" (Sanctum SPA): cookie-basert sesjon.
// Viktig: credentials: 'include' og først et kall til /sanctum/csrf-cookie.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // f.eks. https://api.resultatpuls.no/api/v1
if (!API_BASE) {
  // Kast tidlig i dev
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL mangler. Sett i .env(.local)/Vercel.");
}

async function spaFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) msg += ` – ${j.message}`;
    } catch {}
    throw new Error(msg);
  }
  // noen endpoints (logout) kan returnere 204
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getCsrfCookie() {
  // Må kalles før /auth/login (laravel/sanctum)
  return fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: "include" });
}

export type User = {
  id: string | number;
  name: string;
  email: string;
  role?: "admin" | "editor" | "viewer";
};

export async function me() {
  return spaFetch<User>("/auth/me");
}

export async function login(email: string, password: string) {
  await getCsrfCookie();
  return spaFetch<{ ok: true }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return spaFetch<{ ok: true }>("/auth/logout", { method: "POST" });
}

export { spaFetch };