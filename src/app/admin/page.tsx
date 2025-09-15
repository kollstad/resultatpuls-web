"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHome() {
  const { user, loading } = useAuth();

  if (loading) return <p>Laster…</p>;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-3">
        <p className="text-lg">Du må være innlogget for å se admin.</p>
        <Link href="/login?next=/admin" className="underline">
          Logg inn
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>

      <Card>
        <CardHeader>
          <CardTitle>Hurtigvalg</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/events/new"><Button>Opprett stevne</Button></Link>
          <Link href="/clubs/new"><Button>Ny klubb</Button></Link>
          <Link href="/athletes/new"><Button>Ny utøver</Button></Link>
          <Link href="/results/new"><Button>Registrer resultat</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}