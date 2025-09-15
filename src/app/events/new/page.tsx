"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type CreateEventPayload = {
  name: string;
  type: "outdoor" | "indoor" | "road" | "xc" | "trail";
  start_date: string; // YYYY-MM-DD
  city?: string;
  venue?: string;
};

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Ukjent feil"; }
}

export default function NewEventPage() {
  const [form, setForm] = useState<CreateEventPayload>({
    name: "",
    type: "outdoor",
    start_date: "",
    city: "",
    venue: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await apiRequest("/events", { method: "POST", body: form });
      setMsg("Stevnet ble opprettet ✅");
      // valgfritt: nullstill feltene unntatt type
      setForm({ ...form, name: "", start_date: "", city: "", venue: "" });
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Opprett stevne</h1>
        <Link href="/events" className="ml-auto text-sm underline">Tilbake til liste</Link>
      </div>

      <Card className="rounded-2xl shadow-md border border-white/60 bg-white/70 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle>Nytt stevne</CardTitle>
        </CardHeader>
        <CardContent>
          {err && <p className="text-red-600 mb-3">Feil: {err}</p>}
          {msg && <p className="text-green-700 mb-3">{msg}</p>}

          <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
            {/* Navn */}
            <div className="grid gap-2">
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="f.eks. Sommerstevnet"
                required
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as CreateEventPayload["type"] })}
              >
                <SelectTrigger id="type" className="h-9">
                  <SelectValue placeholder="Velg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outdoor">Utendørs</SelectItem>
                  <SelectItem value="indoor">Innendørs</SelectItem>
                  <SelectItem value="road">Vei</SelectItem>
                  <SelectItem value="xc">Terrengløp</SelectItem>
                  <SelectItem value="trail">Fjell/sti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dato */}
            <div className="grid gap-2">
              <Label htmlFor="start_date">Dato</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
              />
            </div>

            {/* Sted (valgfritt) */}
            <div className="grid gap-2">
              <Label htmlFor="city">By/sted (valgfritt)</Label>
              <Input
                id="city"
                value={form.city ?? ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="f.eks. Oslo"
              />
            </div>

            {/* Arena (valgfritt) */}
            <div className="grid gap-2">
              <Label htmlFor="venue">Arena (valgfritt)</Label>
              <Input
                id="venue"
                value={form.venue ?? ""}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="f.eks. Bislett stadion"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving || !form.name || !form.start_date}>
                {saving ? "Lagrer…" : "Opprett stevne"}
              </Button>
              <Link href="/events" className="text-sm underline">Avbryt</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}