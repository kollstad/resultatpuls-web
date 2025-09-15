"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CheckResult = {
  key: string;
  url: string;
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  message?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function normalizeUrl(pathOrUrl: string) {
  if (!BASE) return pathOrUrl;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const hasLeadingSlash = pathOrUrl.startsWith("/");
  return hasLeadingSlash ? `${BASE}${pathOrUrl}` : `${BASE}/${pathOrUrl}`;
}

async function fetchWithTiming(input: RequestInfo | URL, init?: RequestInit) {
  const started = performance.now();
  const res = await fetch(input, { cache: "no-store", ...init });
  const latency = Math.round(performance.now() - started);
  return { res, latency };
}

export default function StatusGrid() {
  const targets = useMemo(
    () => [
      { key: "ping",          label: "Ping",          url: normalizeUrl("/ping") },
      { key: "events",        label: "Events",        url: normalizeUrl("/events?per_page=1") },
      { key: "clubs",         label: "Clubs",         url: normalizeUrl("/clubs?per_page=1") },
      { key: "athletes",      label: "Athletes",      url: normalizeUrl("/athletes?per_page=1") },
      { key: "performances",  label: "Performances",  url: normalizeUrl("/performances?per_page=1") },
    ],
    []
  );

  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runAll = useCallback(async () => {
    setChecking(true);
    const acc: Record<string, CheckResult> = {};
    try {
      await Promise.all(
        targets.map(async (t) => {
          try {
            const { res, latency } = await fetchWithTiming(t.url);
            acc[t.key] = {
              key: t.key,
              url: t.url,
              ok: res.ok,
              status: res.status,
              latencyMs: latency,
              message: res.ok ? undefined : `HTTP ${res.status}`,
            };
          } catch (e: unknown) {
            acc[t.key] = {
              key: t.key,
              url: t.url,
              ok: false,
              status: null,
              latencyMs: null,
              message: e instanceof Error ? e.message : "Nettverksfeil",
            };
          }
        })
      );
      setResults(acc);
    } finally {
      setLastChecked(new Date());
      setChecking(false);
    }
  }, [targets]);

  useEffect(() => {
    runAll();
  }, [runAll]);

  const overallOk =
    Object.keys(results).length > 0 &&
    Object.values(results).every((r) => r.ok);

  return (
    <Card className="rounded-2xl shadow-md border border-white/60 bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-base">API-status</CardTitle>
        {overallOk ? (
          <Badge className="bg-green-600 hover:bg-green-600">Online</Badge>
        ) : (
          <Badge variant="destructive">Feil</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {targets.map((t) => {
            const r = results[t.key];
            const ok = r?.ok ?? false;
            return (
              <div
                key={t.key}
                className={`rounded-xl border p-3 text-sm ${
                  ok ? "border-green-200 bg-green-50/60" : "border-red-200 bg-red-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{t.label}</div>
                  <Badge
                    variant={ok ? "default" : "destructive"}
                    className={ok ? "bg-green-600 hover:bg-green-600" : ""}
                  >
                    {ok ? "OK" : "Nede"}
                  </Badge>
                </div>
                <div className="text-zinc-600">
                  <div>Status: {r?.status ?? "—"}</div>
                  <div>Responstid: {r?.latencyMs != null ? `${r.latencyMs} ms` : "—"}</div>
                  {r?.message && <div className="mt-1">Melding: {r.message}</div>}
                  <div className="mt-1 truncate text-xs text-zinc-500" title={t.url}>
                    URL: {t.url}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={runAll} disabled={checking}>
            {checking ? "Sjekker…" : "Sjekk på nytt"}
          </Button>
          <span className="text-xs text-zinc-500">
            Sist sjekket: {lastChecked ? lastChecked.toLocaleTimeString() : "—"}
          </span>
          <span className="text-xs text-zinc-500 ml-auto">
            BASE: {BASE || "Mangler NEXT_PUBLIC_API_BASE_URL"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}