export function formatDate(iso?: string) {
  if (!iso) return "";
  // Tar bare YYYY-MM-DD hvis backend sender med tidssone
  return iso.slice(0, 10);
}