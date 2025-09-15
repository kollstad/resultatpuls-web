"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Paginated<T> = { data: T[] };
type Club = { id: string; name: string; short_name: string };
type Gender = "M" | "F"; // utvid til "X" hvis backend støtter

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Ukjent feil"; }
}

export default function NewAthletePage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [sportsId, setSportsId] = useState(""); // idrettens-id (valgfri)
  const [clubId, setClubId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiRequest<Paginated<Club>>("/clubs?per_page=500");
        if (!active) return;
        setClubs(res.data ?? []);
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
      await apiRequest("/athletes", {
        method: "POST",
        body: {
          first_name: firstName,
          last_name: lastName,
          dob: birthDate,      // backend forventer 'dob'
          gender: gender,      // backend forventer 'gender'
          sports_id: sportsId || undefined,
          club_id: clubId,
        },
      });
      setFieldErrors({}); // rydder feltfeil etter suksess
      setMsg("Utøver opprettet ✅");
      // nullstill felter
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setGender("M");
      setSportsId("");
      setClubId(null);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 422 && e.errors) {
        setFieldErrors(e.errors);
        setErr(e.message);
      } else {
        setErr(e instanceof Error ? e.message : "Ukjent feil");
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Opprett utøver</h1>
        <Link href="/athletes" className="ml-auto text-sm underline">Tilbake</Link>
      </div>

      <Card className="rounded-2xl shadow-md border border-white/60 bg-white/70 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle>Ny utøver</CardTitle>
        </CardHeader>
        <CardContent>
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}
          {msg && <p className="text-green-700 mb-3">{msg}</p>}

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-9 w-1/2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
              {/* Fornavn */}
              <div className="grid gap-2">
                <Label htmlFor="first">Fornavn</Label>
                <Input
                  id="first"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.first_name?.length) setFieldErrors(prev => ({ ...prev, first_name: [] }));
                  }}
                  required
                  className={fieldErrors.first_name?.length ? "border-red-500" : undefined}
                />
                {fieldErrors.first_name?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.first_name[0]}</p>
                ) : null}
              </div>

              {/* Etternavn */}
              <div className="grid gap-2">
                <Label htmlFor="last">Etternavn</Label>
                <Input
                  id="last"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.last_name?.length) setFieldErrors(prev => ({ ...prev, last_name: [] }));
                  }}
                  required
                  className={fieldErrors.last_name?.length ? "border-red-500" : undefined}
                />
                {fieldErrors.last_name?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.last_name[0]}</p>
                ) : null}
              </div>

              {/* Fødselsdato */}
              <div className="grid gap-2">
                <Label htmlFor="birth">Fødselsdato</Label>
                <Input
                  id="birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    if (fieldErrors.dob?.length) setFieldErrors(prev => ({ ...prev, dob: [] }));
                  }}
                  required
                  className={fieldErrors.dob?.length ? "border-red-500" : undefined}
                />
                {fieldErrors.dob?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.dob[0]}</p>
                ) : null}
              </div>

              {/* Kjønn */}
              <div className="grid gap-2">
                <Label htmlFor="gender">Kjønn</Label>
                <Select
                  value={gender}
                  onValueChange={(v) => {
                    setGender(v as Gender);
                    if (fieldErrors.gender?.length) setFieldErrors(prev => ({ ...prev, gender: [] }));
                  }}
                >
                  <SelectTrigger
                    id="gender"
                    className={`h-9 ${fieldErrors.gender?.length ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Velg kjønn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Mann</SelectItem>
                    <SelectItem value="F">Kvinne</SelectItem>
                    {/* <SelectItem value="X">Annet</SelectItem> */}
                  </SelectContent>
                </Select>
                {fieldErrors.gender?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.gender[0]}</p>
                ) : null}
              </div>

              {/* Idrettens-ID (valgfri) */}
              <div className="grid gap-2">
                <Label htmlFor="sportsid">Idrettens-ID (valgfri)</Label>
                <Input
                  id="sportsid"
                  value={sportsId}
                  onChange={(e) => {
                    setSportsId(e.target.value);
                    if (fieldErrors.sports_id?.length) setFieldErrors(prev => ({ ...prev, sports_id: [] }));
                  }}
                  placeholder="f.eks. 123456"
                  className={fieldErrors.sports_id?.length ? "border-red-500" : undefined}
                />
                {fieldErrors.sports_id?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.sports_id[0]}</p>
                ) : null}
              </div>

              {/* Klubb */}
              <div className="grid gap-2">
                <Label htmlFor="club">Klubb</Label>
                <Select
                  value={clubId ?? undefined}
                  onValueChange={(v) => {
                    setClubId(v);
                    if (fieldErrors.club_id?.length) setFieldErrors(prev => ({ ...prev, club_id: [] }));
                  }}
                >
                  <SelectTrigger
                    id="club"
                    className={`h-9 ${fieldErrors.club_id?.length ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Velg klubb" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.short_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.club_id?.length ? (
                  <p className="text-sm text-red-600">{fieldErrors.club_id[0]}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!firstName || !lastName || !birthDate || !clubId}
                >
                  Opprett utøver
                </Button>
                <Link href="/athletes" className="text-sm underline">Avbryt</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}