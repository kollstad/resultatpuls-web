"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Health = {
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  message?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // f.eks https://api.resultatpuls.no/api/v1

export default function ApiStatus() {
  const [health, setHealth] = useState<Health>({
    ok: false,
    status: null,
    latencyMs: null,
  });
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const pingUrl = useMemo(() => {
    // Vi forsøker /ping om det finnes, ellers /events (GET)
    if (!BASE) return null;
    return `${BASE}/ping`;
  }, []);

  const check = useCallback(async () => {
    if (!BASE) {
      setHealth({
        ok: false,
        status: null,
        latencyMs: null,
        message: "NEXT_PUBLIC_API_BASE_URL mangler",
      });
      setLastChecked(new Date());
      return;
    }
    setChecking(true);
    const started = performance.now();
    try {
      // Prøv ping først
      let res = await fetch(pingUrl ?? "", { cache: "no-store" });
      if (!res.ok) {
        // fallback: events
        res = await fetch(`${BASE}/events?per_page=1`, { cache: "no-store" });
      }
      const latency = Math.round(performance.now() - started);
      setHealth({
        ok: res.ok,
        status: res.status,
        latencyMs: latency,
        message: res.ok ? undefined : `HTTP ${res.status}`,
      });
    } catch (e: unknown) {
      const latency = Math.round(performance.now() - started);
      setHealth({
        ok: false,
        status: null,
        latencyMs: latency,
        message:
          e instanceof Error ? e.message : "Klarte ikke å kontakte API-et",
      });
    } finally {
      setLastChecked(new Date());
      setChecking(false);
    }
  }, [pingUrl]);

  useEffect(() => {
    check();
  }, [check]);

  const badge = health.ok ? (
    <Badge className="bg-green-600 hover:bg-green-600">Online</Badge>
  ) : (
    <Badge variant="destructive">Nede</Badge>
  );

  return (
    <Card className="rounded-2xl shadow-md border border-white/60 bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">API-status</CardTitle>
        {badge}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-zinc-500 w-28">Base-URL</span>
          <span className="truncate">{BASE ?? "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-zinc-500 w-28">HTTP-status</span>
          <span>{health.status ?? "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-zinc-500 w-28">Responstid</span>
          <span>{health.latencyMs !== null ? `${health.latencyMs} ms` : "—"}</span>
        </div>
        {health.message && (
          <div className="flex gap-2">
            <span className="text-zinc-500 w-28">Melding</span>
            <span className="text-zinc-700">{health.message}</span>
          </div>
        )}
        <div className="flex items-center gap-3 pt-2">
          <Button size="sm" onClick={check} disabled={checking}>
            {checking ? "Tester…" : "Prøv igjen"}
          </Button>
          <span className="text-xs text-zinc-500">
            Sist sjekket: {lastChecked ? lastChecked.toLocaleTimeString() : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}