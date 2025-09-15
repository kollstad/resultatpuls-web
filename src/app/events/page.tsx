"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/pagination";
import { toErrorMessage } from "@/lib/errors";

type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
};

type EventRow = {
  id: string;
  name: string;
  type: string;
  start_date: string;
  city?: string | null;
  venue?: string | null;
};

export default function EventsPage() {
  const [list, setList] = useState<Paginated<EventRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtre (server)
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);

      const params = new URLSearchParams();
      if (name.trim()) params.set("q", name.trim());
      if (type.trim()) params.set("type", type.trim());
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      params.set("per_page", String(perPage));
      params.set("page", String(page));

      try {
        const res = await apiRequest<Paginated<EventRow>>(`/events?${params.toString()}`);
        if (!active) return;
        setList(res);
      } catch (e: unknown) {
        if (!active) return;
        setErr(toErrorMessage(e, "Kunne ikke laste stevner"));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [name, type, dateFrom, dateTo, perPage, page]);

  function ResetFilters() {
    setName("");
    setType("");
    setDateFrom("");
    setDateTo("");
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
          <CardTitle className="text-2xl tracking-tight">Stevner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="name">Navn</Label>
              <Input id="name" placeholder="f.eks. Sommerstevnet" value={name} onChange={(e) => { setName(e.target.value); setPage(1); }} />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type || "all"}
                onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(1); }}
              >
                <SelectTrigger id="type" className="h-9">
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="outdoor">Utendørs</SelectItem>
                  <SelectItem value="indoor">Innendørs</SelectItem>
                  <SelectItem value="road">Vei</SelectItem>
                  <SelectItem value="xc">Terrengløp</SelectItem>
                  <SelectItem value="trail">Fjell/sti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="df">Fra dato</Label>
              <Input id="df" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="dt">Til dato</Label>
              <Input id="dt" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
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
            <Button variant="secondary" onClick={ResetFilters}>
              Nullstill
            </Button>
            <Link
              href="/events/new"
              className="ml-auto inline-flex items-center rounded-md bg-zinc-900 text-white h-9 px-3 text-sm hover:bg-zinc-800"
            >
              + Opprett stevne
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
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-20" />
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
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Navn</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Type</TableHead>
                      <TableHead className="uppercase tracking-wide text-xs text-zinc-500 font-semibold">Sted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list?.data ?? []).map((evt) => (
                      <TableRow key={evt.id} className="hover:bg-zinc-50 transition-colors">
                        <TableCell className="whitespace-nowrap">{formatDate(evt.start_date)}</TableCell>
                        <TableCell>{evt.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{evt.type}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={evt.venue ?? evt.city ?? ""}>
                          {evt.venue ?? evt.city ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(list?.data?.length ?? 0) === 0 && !loading && (
                  <p className="text-sm text-zinc-500 mt-3">Ingen stevner matcher filtrene.</p>
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