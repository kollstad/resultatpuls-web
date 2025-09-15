"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Paginated<T> = { data: T[] };
type District = { id: string; name: string; code: string };

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Ukjent feil"; }
}

export default function NewClubPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [districtId, setDistrictId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiRequest<Paginated<District>>("/districts?per_page=200");
        if (!active) return;
        setDistricts(res.data ?? []);
      } catch (e: unknown) {
        if (!active) return;
        setErr(getErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await apiRequest("/clubs", {
        method: "POST",
        body: {
          name,
          short_name: shortName,
          district_id: districtId,
        },
      });
      setMsg("Klubb opprettet ✅");
      setName("");
      setShortName("");
      setDistrictId(null);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Opprett klubb</h1>
        <Link href="/events" className="ml-auto text-sm underline">Tilbake</Link>
      </div>

      <Card className="rounded-2xl shadow-md border border-white/60 bg-white/70 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle>Ny klubb</CardTitle>
        </CardHeader>
        <CardContent>
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}
          {msg && <p className="text-green-700 mb-3">{msg}</p>}

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="name">Navn</Label>
                <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="short">Kortnavn</Label>
                <Input id="short" value={shortName} onChange={(e)=>setShortName(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="district">Krets</Label>
                <Select
                  value={districtId ?? undefined}
                  onValueChange={(v)=>setDistrictId(v)}
                >
                  <SelectTrigger id="district" className="h-9">
                    <SelectValue placeholder="Velg krets" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!name || !shortName || !districtId}>
                  Opprett klubb
                </Button>
                <Link href="/events" className="text-sm underline">Avbryt</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}