"use client";

type Props = {
  page: number;
  total?: number;
  perPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({
  page,
  total,
  perPage,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const from = (page - 1) * perPage + 1;
  const to = total ? Math.min(page * perPage, total) : page * perPage;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
      <div>
        {total !== undefined ? (
          <span>Viser {from}–{to} av {total}</span>
        ) : (
          <span>Side {page}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="h-9 rounded-md px-3 border bg-white hover:bg-zinc-50 disabled:opacity-50"
        >
          Forrige
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="h-9 rounded-md px-3 border bg-white hover:bg-zinc-50 disabled:opacity-50"
        >
          Neste
        </button>
      </div>
    </div>
  );
}