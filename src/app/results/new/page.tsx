"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Paginated<T> = { data: T[] };
type EventRow = { id: string; name: string; start_date: string };
type AthleteRow = { id: string; first_name: string; last_name: string };

export default function NewResultPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    event_id: "",
    athlete_id: "",
    discipline_code: "100m",
    unit: "s",
    mark_display: "",
    wind: "",
  });

  // Hent events og athletes
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const [e, a] = await Promise.all([
          apiRequest<Paginated<EventRow>>("/events"),
          apiRequest<Paginated<AthleteRow>>("/athletes"),
        ]);
        if (!active) return;
        setEvents(e.data ?? []);
        setAthletes(a.data ?? []);
      } catch (e: any) {
        if (!active) return;
        setErr(e.message ?? "Kunne ikke laste data");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      await apiRequest("/performances", {
        method: "POST",
        body: {
          event_id: form.event_id,
          discipline_code: form.discipline_code,
          age_category: "Senior",
          round: "finale",
          timing_method: "auto",
          athlete_id: form.athlete_id,
          unit: form.unit,
          mark_display: form.mark_display,
          wind: form.wind ? parseFloat(form.wind) : undefined,
          status: "OK",
          is_legal: true,
        },
      });
      setMsg("Resultat registrert ✅");
      setForm({ ...form, mark_display: "", wind: "" });
    } catch (e: any) {
      setErr(e.message ?? "Kunne ikke lagre");
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Registrer resultat</h1>

      {loading && <p>Laster data…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {msg && <p className="text-green-600">{msg}</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Stevne */}
          <div className="grid gap-2">
            <Label htmlFor="event">Stevne</Label>
            <select
              id="event"
              className="border rounded-md h-9 px-2"
              value={form.event_id}
              onChange={(e) => setForm({ ...form, event_id: e.target.value })}
              required
            >
              <option value="">Velg stevne…</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.start_date}
                </option>
              ))}
            </select>
          </div>

          {/* Utøver */}
          <div className="grid gap-2">
            <Label htmlFor="athlete">Utøver</Label>
            <select
              id="athlete"
              className="border rounded-md h-9 px-2"
              value={form.athlete_id}
              onChange={(e) => setForm({ ...form, athlete_id: e.target.value })}
              required
            >
              <option value="">Velg utøver…</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Øvelse */}
          <div className="grid gap-2">
            <Label htmlFor="discipline">Øvelse (kode)</Label>
            <Input
              id="discipline"
              value={form.discipline_code}
              onChange={(e) => setForm({ ...form, discipline_code: e.target.value })}
              placeholder="100m, 200m, LJ …"
              required
            />
          </div>

          {/* Resultat */}
          <div className="grid gap-2">
            <Label htmlFor="mark">Resultat</Label>
            <Input
              id="mark"
              value={form.mark_display}
              onChange={(e) => setForm({ ...form, mark_display: e.target.value })}
              placeholder='f.eks. "11.72" eller "1:59.12"'
              required
            />
          </div>

          {/* Vind */}
          <div className="grid gap-2">
            <Label htmlFor="wind">Vind (m/s, valgfri)</Label>
            <Input
              id="wind"
              value={form.wind}
              onChange={(e) => setForm({ ...form, wind: e.target.value })}
              placeholder="0.8"
            />
          </div>

          <Button
            type="submit"
            disabled={!form.event_id || !form.athlete_id || !form.mark_display}
          >
            Lagre resultat
          </Button>
        </form>
      )}
    </div>
  );
}