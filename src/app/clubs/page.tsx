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
type Club = { id: string; name: string; short_name: string; district_id: string | null };
type District = { id: string; name: string; code: string };

export default function ClubsPage() {
  const [list, setList] = useState<Paginated<Club> | null>(null);
  const [districts, setDistricts] = useState<Paginated<District> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtre
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (district) params.set("district_id", district);
      params.set("per_page", String(perPage));
      params.set("page", String(page));
      try {
        const [c, d] = await Promise.all([
          apiRequest<Paginated<Club>>(`/clubs?${params.toString()}`),
          apiRequest<Paginated<District>>(`/districts?per_page=500`),
        ]);
        if (!active) return;
        setList(c);
        setDistricts(d);
      } catch (e) {
        if (!active) return;
        setErr(e instanceof Error ? e.message : "Kunne ikke laste klubber");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [q, district, perPage, page]);

  const districtNameById = useMemo(() => {
    const m = new Map<string, string>();
    (districts?.data ?? []).forEach(x => m.set(x.id, `${x.name} (${x.code})`));
    return m;
  }, [districts]);

  function reset() {
    setQ("");
    setDistrict("");
    setPerPage(25);
    setPage(1);
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
          <CardTitle className="text-2xl tracking-tight">Klubber</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="q">Søk (navn/kortnavn)</Label>
              <Input id="q" value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="f.eks. Tjalve, IL" />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="dist">Krets</Label>
              <Select value={district || "all"} onValueChange={(v)=>{ setDistrict(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger id="dist" className="h-9">
                  <SelectValue placeholder="Alle kretser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  {(districts?.data ?? []).map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.code})
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

            <div className="grid gap-1">
              <Label className="opacity-0"> </Label>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={reset}>Nullstill</Button>
                <Link href="/clubs/new" className="ml-auto inline-flex items-center rounded-md bg-zinc-900 text-white h-9 px-3 text-sm hover:bg-zinc-800">
                  + Ny klubb
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card className="rounded-2xl border bg-white shadow-md">
        <CardContent className="pt-4">
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}
          {loading ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white/90 backdrop-blur z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Klubb</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Kort</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Krets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list?.data ?? []).map((c, idx) => (
                      <TableRow key={c.id} className={`${idx % 2 ? "bg-zinc-50" : ""} hover:bg-zinc-50 transition-colors`}>
                        <TableCell className="max-w-[360px] truncate" title={c.name}>{c.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{c.short_name}</TableCell>
                        <TableCell className="max-w-[360px] truncate" title={districtNameById.get(c.district_id ?? "") ?? ""}>
                          {districtNameById.get(c.district_id ?? "") ?? "–"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(list?.data?.length ?? 0) === 0 && !loading && (
                  <p className="text-sm text-zinc-500 mt-3">Ingen klubber matcher filtrene.</p>
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