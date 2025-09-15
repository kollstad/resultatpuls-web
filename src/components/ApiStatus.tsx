"use client";

import StatusGrid from "@/components/StatusGrid";

export default function StatusPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Systemstatus</h1>
      <p className="text-sm text-zinc-600">
        Siden sjekker flere API-endepunkter (ping + lister) og viser status, responstid og HTTP-koder.
      </p>
      <StatusGrid />
    </div>
  );
}