// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { Geist } from "next/font/google";
import Logo from "@/components/Logo";
import { BRAND_NAME } from "@/components/brand";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ClientNav from "@/components/auth/ClientNav";

const geist = Geist({ subsets: ["latin"] });

// Du kan overstyre docs-url i Vercel med NEXT_PUBLIC_DOCS_URL
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://api.resultatpuls.no/docs";

export const metadata: Metadata = {
  title: BRAND_NAME ?? "ResultatPuls",
  description: "Frontend for ResultatPuls API – terminliste og resultater.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="nb">
      {/* Vi legger font-klassen på body, og litt pen bakgrunn */}
      <body className={`${geist.className} bg-zinc-50 text-zinc-900`}>
        <AuthProvider>
          {/* Toppmeny */}
          <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
            <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
              {/* Logo + hjemlenke */}
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <Logo className="h-6 w-6" />
                <span>{BRAND_NAME ?? "ResultatPuls"}</span>
              </Link>

              {/* Primærnavigasjon */}
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

              {/* Høyrekolonne: docs + auth */}
              <div className="ml-auto flex items-center gap-4">
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm hover:underline"
                >
                  API-dokumentasjon
                </a>
                <ClientNav />
              </div>
            </nav>
          </header>

          {/* Innhold */}
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

          {/* Footer */}
          <footer className="border-t bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-zinc-600 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {year} {BRAND_NAME ?? "ResultatPuls"}. Utviklet av{" "}
                <a href="https://fiko.no" target="_blank" rel="noreferrer" className="underline">
                  Fiko
                </a>
                .
              </p>
              <div className="flex items-center gap-4">
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="underline">
                  API-dokumentasjon
                </a>
                <Link href="/about" className="underline">
                  Om
                </Link>
              </div>
            </div>
          </footer>

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}