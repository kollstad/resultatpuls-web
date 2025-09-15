"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useDebounce } from "@/lib/useDebounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Pagination from "@/components/pagination";

type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  total?: number;
  per_page?: number;
};

type EventRow = { id: string; name: string; start_date: string };
type EventDisciplineRow = { event?: EventRow | null; discipline_code?: string };
type AthleteRow = { id: string; first_name: string; last_name: string };
type PerformanceRow = {
  id: string;
  unit: "s" | "m" | "km";
  mark_display: string;
  position?: number | null;
  status: "OK" | "DQ" | "DNF" | "DNS" | "NM";
  wind?: number | null;
  athlete_id?: string | null;
  event_discipline?: EventDisciplineRow | null;
};

type SortKey = "-created_at" | "mark_raw" | "-mark_raw";

export default function ResultsPage() {
  // Server-filtre
  const [discipline, setDiscipline] = useState("");
  const [legalOnly, setLegalOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [perPage, setPerPage] = useState(25);
  const [sort, setSort] = useState<SortKey>("-created_at");
  const [page, setPage] = useState(1); // 👈 paginering

  // Klient-søk (utøvernavn)
  const [qAthlete, setQAthlete] = useState("");
  const qAthleteDebounced = useDebounce(qAthlete, 300);

  // Data
  const [perfs, setPerfs] = useState<Paginated<PerformanceRow> | null>(null);
  const [athletes, setAthletes] = useState<Paginated<AthleteRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Hent athleteliste (for navnoppslag)
  useEffect(() => {
    let active = true;
    async function loadAthletes() {
      try {
        const a = await apiRequest<Paginated<AthleteRow>>(`/athletes?per_page=500`);
        if (!active) return;
        setAthletes(a);
      } catch {
        /* optional */
      }
    }
    loadAthletes();
    return () => { active = false; };
  }, []);

  // Hent performances (server-filtre i URL)
  useEffect(() => {
    let active = true;
    async function loadPerfs() {
      setLoading(true);
      setErr(null);

      const params = new URLSearchParams();
      if (discipline.trim()) params.set("discipline_code", discipline.trim());
      if (legalOnly) params.set("legal", "true");
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      params.set("sort", sort);
      params.set("per_page", String(perPage));
      params.set("page", String(page)); // 👈 paginering

      try {
        const p = await apiRequest<Paginated<PerformanceRow>>(`/performances?${params.toString()}`);
        if (!active) return;
        setPerfs(p);
      } catch (err: unknown) {
        if (!active) return;
        setErr(err instanceof Error ? err.message : "Kunne ikke laste resultater");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPerfs();
    return () => { active = false; };
  }, [discipline, legalOnly, dateFrom, dateTo, sort, perPage, page]);

  // Oppslag: athlete_id -> "Fornavn Etternavn"
  const nameByAthleteId = useMemo(() => {
    const map = new Map<string, string>();
    (athletes?.data ?? []).forEach(a => map.set(a.id, `${a.first_name} ${a.last_name}`));
    return map;
  }, [athletes]);

  // Klientside-søk i utøvernavn
  const filteredRows = useMemo(() => {
    const rows = perfs?.data ?? [];
    if (!qAthleteDebounced.trim()) return rows;
    const q = qAthleteDebounced.toLowerCase();
    return rows.filter(p => {
      if (!p.athlete_id) return false;
      const name = nameByAthleteId.get(p.athlete_id) ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [perfs, qAthleteDebounced, nameByAthleteId]);

  function ResetFilters() {
    setDiscipline("");
    setLegalOnly(false);
    setDateFrom("");
    setDateTo("");
    setPerPage(25);
    setSort("-created_at");
    setQAthlete("");
    setPage(1); // 👈 hopp tilbake til første side når vi nullstiller
  }

  const currentPage = perfs?.current_page ?? page;
  const lastPage = perfs?.last_page ?? 1;
  const total = perfs?.total;
  const effectivePerPage = perfs?.per_page ?? perPage;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Toolbar */}
      <Card className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl tracking-tight">Siste resultater</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Utøver (klientsøk) */}
            <div className="grid gap-1">
              <Label htmlFor="qa">Søk utøver</Label>
              <Input id="qa" placeholder="f.eks. Kari" value={qAthlete} onChange={e=>setQAthlete(e.target.value)} />
            </div>

            {/* Øvelse (server) */}
            <div className="grid gap-1">
              <Label htmlFor="disc">Øvelse (kode)</Label>
              <Input id="disc" placeholder="100m, 200m, LJ…" value={discipline} onChange={e=>{ setDiscipline(e.target.value); setPage(1); }} />
            </div>

            {/* Dato (server) */}
            <div className="grid gap-1">
              <Label htmlFor="df">Fra dato</Label>
              <Input id="df" type="date" value={dateFrom} onChange={e=>{ setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="dt">Til dato</Label>
              <Input id="dt" type="date" value={dateTo} onChange={e=>{ setDateTo(e.target.value); setPage(1); }} />
            </div>

            {/* Sort (server) */}
            <div className="grid gap-1">
              <Label htmlFor="sort">Sortering</Label>
              <Select value={sort} onValueChange={(v: SortKey)=>{ setSort(v); setPage(1); }}>
                <SelectTrigger id="sort" className="h-10">
                  <SelectValue placeholder="Velg sortering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Nyeste registrering</SelectItem>
                  <SelectItem value="mark_raw">Beste tid / lavest verdi</SelectItem>
                  <SelectItem value="-mark_raw">Beste lengde/kast / høyest verdi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Per page (server) */}
            <div className="grid gap-1">
              <Label htmlFor="pp">Per side</Label>
              <Select value={String(perPage)} onValueChange={(v)=>{ setPerPage(parseInt(v)); setPage(1); }}>
                <SelectTrigger id="pp" className="h-10">
                  <SelectValue placeholder="Velg antall" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="legal" checked={legalOnly} onCheckedChange={(v)=>{ setLegalOnly(v); setPage(1); }} />
              <Label htmlFor="legal">Kun lovlige</Label>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="secondary" className="h-10 px-4" onClick={ResetFilters}>Nullstill</Button>

            <Link
              href="/results/new"
              className="ml-auto inline-flex items-center rounded-lg bg-zinc-900 text-white h-10 px-4 text-sm hover:bg-zinc-800"
            >
              + Registrer resultat
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Resultatliste */}
      <Card className="rounded-2xl border bg-white shadow-md">
        <CardContent className="pt-4">
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}

          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white/90 backdrop-blur z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Dato</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Stevne</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Øvelse</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Utøver</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold text-right">Resultat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((p, idx) => {
                      const evt = p.event_discipline?.event;
                      const name = p.athlete_id ? (nameByAthleteId.get(p.athlete_id) ?? p.athlete_id) : "-";
                      const disc = p.event_discipline?.discipline_code ?? "";
                      const wind = p.wind ?? null;
                      const zebra = idx % 2 === 1 ? "bg-zinc-50" : "";
                      const statusChip = p.status !== "OK" ? (
                        <Badge variant="secondary" className="ml-2">{p.status}</Badge>
                      ) : null;

                      return (
                        <TableRow key={p.id} className={`${zebra} hover:bg-zinc-50 transition-colors`}>
                          <TableCell className="whitespace-nowrap">{formatDate(evt?.start_date)}</TableCell>
                          <TableCell className="max-w-[320px] truncate" title={evt?.name ?? ""}>
                            {evt?.name ?? ""}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{disc}</TableCell>
                          <TableCell className="max-w-[260px] truncate" title={name}>
                            {name}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <span className="font-mono font-semibold">{p.mark_display}</span>
                            {wind !== null && <span className="text-zinc-500 ml-1 font-mono">({wind} m/s)</span>}
                            {statusChip}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredRows.length === 0 && !loading && (
                  <p className="text-sm text-zinc-500 mt-3">Ingen resultater matcher filtrene.</p>
                )}
              </div>

              {/* Paginering */}
              {perfs && (
                <Pagination
                  page={currentPage}
                  total={total}
                  perPage={effectivePerPage}
                  hasPrev={currentPage > 1}
                  hasNext={currentPage < (lastPage ?? 1)}
                  onPrev={() => setPage(p => Math.max(1, p - 1))}
                  onNext={() => setPage(p => p + 1)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}