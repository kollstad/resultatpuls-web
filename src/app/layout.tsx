import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Geist } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import { BRAND_NAME, BRAND_TAGLINE, DOCS_URL } from "@/components/brand";
// Google-font
const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geist.className} bg-gradient-to-b from-zinc-50 to-white text-zinc-900`}>
        {/* Toppmeny */}
        <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
          <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-zinc-900">
              <Logo className="h-6 w-6" />
              <span className="font-semibold tracking-tight">{BRAND_NAME}</span>
            </Link>

            <div className="ml-2 flex items-center gap-4">
              <Link href="/events" className="text-sm hover:underline">Stevner</Link>
              <Link href="/results" className="text-sm hover:underline">Resultater</Link>
              <Link href="/clubs" className="text-sm hover:underline">Klubber</Link>
              <Link href="/athletes" className="text-sm hover:underline">Utøvere</Link>
              <Link href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">API-dokumentasjon</Link>
            </div>
          </nav>
        </header>

        {/* Hovedinnhold */}
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
          <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-600">
            <p>© {new Date().getFullYear()} {BRAND_NAME}. Utviklet av <a href="https://fiko.no" target="_blank" rel="noopener noreferrer" className="underline">Fiko</a>.</p>
            <div className="flex gap-4">
              <Link href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">API-dokumentasjon</Link>
              <Link href="/about" className="hover:underline">Om prosjektet</Link>
            </div>
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}