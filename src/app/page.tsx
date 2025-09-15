import Link from "next/link";
import Logo from "@/components/Logo";
import { BRAND_NAME, BRAND_TAGLINE } from "@/components/brand";
import ApiStatus from "@/components/ApiStatus";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="flex flex-col items-start gap-6 md:gap-8">
        <div className="flex items-center gap-3 text-zinc-900">
          <Logo className="h-10 w-10" />
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{BRAND_NAME}</h1>
            <p className="text-zinc-600">{BRAND_TAGLINE}</p>
          </div>
        </div>

          <p className="max-w-2xl text-zinc-700 leading-relaxed">
          {BRAND_NAME} samler og viser resultater fra norsk friidrett – på og utenfor banen.
          Åpent API for arrangører, solide valideringer mot juks, og brukervennlige skjema for registrering.
          Bygget på Laravel (API) og Next.js (frontend). Se dokumentasjon på{" "}
          <Link href="/docs" className="underline">/docs</Link>.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/results"
            className="inline-flex items-center rounded-lg bg-zinc-900 text-white h-10 px-4 text-sm hover:bg-zinc-800"
          >
            Se siste resultater
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center rounded-lg border h-10 px-4 text-sm hover:bg-zinc-50"
          >
            Bla i stevner
          </Link>
          <Link
            href="/results/new"
            className="inline-flex items-center rounded-lg border h-10 px-4 text-sm hover:bg-zinc-50"
          >
            + Registrer resultat
          </Link>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4 w-full">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-medium mb-1">Åpent API</h3>
            <p className="text-sm text-zinc-600">
              Full dokumentasjon på <code className="text-xs">/docs</code>. Støtter postering fra arrangør med nøkkel og rate-limit.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-medium mb-1">Datakvalitet</h3>
            <p className="text-sm text-zinc-600">
              Validering av øvelse, enhet, vind og status. Sporbarhet til stevne og arrangør.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-medium mb-1">Klubb & utøver</h3>
            <p className="text-sm text-zinc-600">
              Utøver knyttes til klubb og krets. Søk og filtrering på kjønn, dato, øvelse.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}