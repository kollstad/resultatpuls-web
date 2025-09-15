"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      router.push(next);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Innlogging feilet";
      setErr(msg);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="rounded-2xl shadow-md border bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Logg inn</CardTitle>
        </CardHeader>
        <CardContent>
          {err && <p className="text-red-600 mb-3">{err}</p>}
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="pw">Passord</Label>
              <Input id="pw" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Logger inn…" : "Logg inn"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}