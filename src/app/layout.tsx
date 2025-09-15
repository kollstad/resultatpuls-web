import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { BRAND_NAME } from "@/components/brand";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://api.resultatpuls.no/docs";

export const metadata: Metadata = {
  title: BRAND_NAME ?? "ResultatPuls",
  description: "Frontend for Friidrett API",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb">
      <body className="bg-zinc-50 text-zinc-900">
        {/* Toppmeny */}
        <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              {BRAND_NAME ?? "ResultatPuls"}
            </Link>

            <Link href="/events" className="text-sm hover:underline">
              Stevner
            </Link>
            <Link href="/results" className="text-sm hover:underline">
              Resultater
            </Link>
            <Link href="/clubs" className="text-sm hover:underline">
              Klubber
            </Link>
            <Link href="/athletes" className="text-sm hover:underline">
              Utøvere
            </Link>
            <Link href="/status" className="text-sm hover:underline">
              Status
            </Link>

            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-sm hover:underline"
            >
              API-dokumentasjon
            </a>
          </nav>
        </header>

        {/* Innhold */}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        {/* Bunntekst */}
        <footer className="border-t bg-white/60">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-zinc-600 flex flex-wrap gap-3 items-center">
            <span>© {new Date().getFullYear()} {BRAND_NAME ?? "ResultatPuls"}</span>
            <span className="mx-2">•</span>
            <span>Utviklet av Fiko</span>
            <span className="mx-2">•</span>
            <a href={DOCS_URL} target="_blank" rel="noreferrer" className="hover:underline">
              Åpent API
            </a>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}