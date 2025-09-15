"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/districts`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setDistricts(json.data ?? []))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Test API – Districts</h1>
      {error && <p className="text-red-600">Feil: {error}</p>}
      <ul className="list-disc pl-5 space-y-1">
        {districts.map(d => (
          <li key={d.id}>{d.name} ({d.code})</li>
        ))}
      </ul>
    </div>
  );
}