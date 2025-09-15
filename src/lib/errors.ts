// src/lib/errors.ts
export function toErrorMessage(err: unknown, fallback = "Ukjent feil"): string {
  // Klassisk Error
  if (err instanceof Error) return err.message;

  // Objekter med "message"-felt
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }

  // Prøv å serialisere
  try {
    const s = JSON.stringify(err);
    if (s && s !== "{}") return s;
  } catch {
    /* ignore */
  }
  return fallback;
}