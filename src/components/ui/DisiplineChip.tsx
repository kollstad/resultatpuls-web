type Props = { code?: string };

export function DisciplineChip({ code }: Props) {
  if (!code) return null;
  const c = code.toUpperCase();

  let klass = "bg-zinc-100 text-zinc-800";
  if (/^\d{2,3}M$/.test(c)) klass = "bg-blue-100 text-blue-800";            // 100m, 200m, 400m...
  else if (/^(LJ|TJ|HJ|PV)$/.test(c)) klass = "bg-emerald-100 text-emerald-800"; // hopp
  else if (/^(SP|DT|HT|JT)$/.test(c)) klass = "bg-amber-100 text-amber-800";     // kast
  else if (/^(MAR|HM|10K|5K)$/.test(c)) klass = "bg-purple-100 text-purple-800"; // vei

  return <span className={`inline-block text-xs px-2 py-0.5 rounded-md ${klass}`}>{c}</span>;
}