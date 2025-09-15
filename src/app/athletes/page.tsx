"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/pagination";

type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
};
type Club = { id: string; name: string; short_name: string };
type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  dob?: string | null;
  sex?: "M" | "F" | null;
  gender?: "M" | "F" | null;
  club_id?: string | null;
};

export default function AthletesPage() {
  const [list, setList] = useState<Paginated<Athlete> | null>(null);
  const [clubs, setClubs] = useState<Paginated<Club> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtre (server)
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [club, setClub] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (gender) params.set("gender", gender);
      if (club) params.set("club_id", club);
      params.set("per_page", String(perPage));
      params.set("page", String(page));
      try {
        const [a, c] = await Promise.all([
          apiRequest<Paginated<Athlete>>(`/athletes?${params.toString()}`),
          apiRequest<Paginated<Club>>(`/clubs?per_page=500`),
        ]);
        if (!active) return;
        setList(a);
        setClubs(c);
      } catch (e) {
        if (!active) return;
        setErr(e instanceof Error ? e.message : "Kunne ikke laste utøvere");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [q, gender, club, perPage, page]);

  const clubNameById = useMemo(() => {
    const m = new Map<string, string>();
    (clubs?.data ?? []).forEach(cl => m.set(cl.id, `${cl.name} (${cl.short_name})`));
    return m;
  }, [clubs]);

  function reset() {
    setQ("");
    setGender("");
    setClub("");
    setPerPage(25);
    setPage(1);
  }

  function fmtDate(a: Athlete) {
    const d = (a.birth_date ?? a.dob ?? "") || "";
    return d ? d.slice(0,10) : "";
  }

  const currentPage = list?.current_page ?? page;
  const total = list?.total;
  const lastPage = list?.last_page ?? 1;
  const effectivePerPage = list?.per_page ?? perPage;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Toolbar */}
      <Card className="rounded-2xl border bg-white/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl tracking-tight">Utøvere</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="q">Søk (navn)</Label>
              <Input id="q" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="f.eks. Kari Nordmann" />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="gender">Kjønn</Label>
              <Select value={gender || "all"} onValueChange={(v)=>{ setGender(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger id="gender" className="h-9">
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="M">Menn</SelectItem>
                  <SelectItem value="F">Kvinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1 lg:col-span-2">
              <Label htmlFor="club">Klubb</Label>
              <Select value={club || "all"} onValueChange={(v)=>{ setClub(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger id="club" className="h-9">
                  <SelectValue placeholder="Alle klubber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  {(clubs?.data ?? []).map(cl => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.name} ({cl.short_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="pp">Per side</Label>
              <Select value={String(perPage)} onValueChange={(v)=>{ setPerPage(parseInt(v)); setPage(1); }}>
                <SelectTrigger id="pp" className="h-9">
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
            <Button variant="secondary" onClick={reset}>Nullstill</Button>
            <Link href="/athletes/new" className="ml-auto inline-flex items-center rounded-md bg-zinc-900 text-white h-9 px-3 text-sm hover:bg-zinc-800">
              + Ny utøver
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="rounded-2xl border bg-white shadow-md">
        <CardContent className="pt-4">
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white/90 backdrop-blur z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Navn</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Født</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Kjønn</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Klubb</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list?.data ?? []).map((a, idx) => {
                      const g = (a.gender ?? a.sex ?? "") || "";
                      const clubLabel = a.club_id ? (clubNameById.get(a.club_id) ?? a.club_id) : "–";
                      return (
                        <TableRow key={a.id} className={`${idx % 2 ? "bg-zinc-50" : ""} hover:bg-zinc-50 transition-colors`}>
                          <TableCell>{a.first_name} {a.last_name}</TableCell>
                          <TableCell className="whitespace-nowrap">{fmtDate(a)}</TableCell>
                          <TableCell className="whitespace-nowrap">{g}</TableCell>
                          <TableCell className="max-w-[360px] truncate" title={clubLabel}>{clubLabel}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {(list?.data?.length ?? 0) === 0 && !loading && (
                  <p className="text-sm text-zinc-500 mt-3">Ingen utøvere matcher filtrene.</p>
                )}
              </div>

              {list && (
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