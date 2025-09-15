// src/app/status/page.tsx
"use client";

import ApiStatus from "@/components/ApiStatus";

export default function StatusPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Systemstatus</h1>
      <p className="text-sm text-zinc-600">
        Denne siden sjekker tilgjengeligheten til API-et (base-URL fra miljøvariabelen).
      </p>
      <ApiStatus />
    </div>
  );
}