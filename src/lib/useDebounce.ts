import { useEffect, useState } from "react";

/** Returnerer en debouncet verdi etter N ms (default 300) */
export function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setV(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return v;
}