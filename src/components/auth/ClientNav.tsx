"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";

export default function ClientNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-zinc-500">Laster…</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm hover:underline">
        Logg inn
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Hei, {user.name}{user.role ? ` (${user.role})` : ""}</span>
      <Button size="sm" variant="secondary" onClick={logout}>
        Logg ut
      </Button>
    </div>
  );
}