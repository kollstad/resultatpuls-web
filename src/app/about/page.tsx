import Link from "next/link";
import Logo from "@/components/Logo";
import { BRAND_NAME, BRAND_TAGLINE } from "@/components/brand";

export const metadata = {
  title: `Om ${BRAND_NAME}`,
  description: `${BRAND_NAME} – ${BRAND_TAGLINE}`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="flex items-center gap-3">
        <Logo className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Om {BRAND_NAME}</h1>
          <p className="text-zinc-600">{BRAND_TAGLINE}</p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Hva er dette?</h2>
        <p className="text-zinc-700 leading-relaxed">
          {BRAND_NAME} samler, viser og kvalitetssikrer resultater fra norsk friidrett — på bane og utenfor banen.
          Arrangører kan registrere stevner og resultater gjennom et åpent, dokumentert API.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-medium mb-1">Teknologi</h3>
          <p className="text-sm text-zinc-600">
            Backend: Laravel (Sanctum, rate limiting, Scribe-dokumentasjon).<br />
            Frontend: Next.js (App Router), Tailwind + shadcn/ui.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-medium mb-1">Data & kvalitet</h3>
          <p className="text-sm text-zinc-600">
            Strenge valideringer på øvelse, enheter og status (OK/DQ/DNF/DNS/NM), sporbarhet til stevne og arrangør.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Åpent API</h2>
        <p className="text-zinc-700 leading-relaxed">
          Full dokumentasjon finner du på{" "}
          <Link href="/docs" className="underline">/docs</Link>. API-et støtter postering fra arrangører med token
          (Sanctum), og har innebygd rate-limiting for å hindre misbruk.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg bg-zinc-900 text-white h-10 px-4 text-sm hover:bg-zinc-800"
          >
            Åpne API-dokumentasjon
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center rounded-lg border h-10 px-4 text-sm hover:bg-zinc-50"
          >
            Se siste resultater
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Kontakt</h2>
        <p className="text-zinc-700 leading-relaxed">
          Har du spørsmål, ønsker integrasjon eller vil bidra? Ta kontakt – vi setter pris på innspill fra både arrangører og klubber.
        </p>
      </section>
    </main>
  );
}