import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl animate-fade" />
        <div className="absolute -right-10 bottom-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl animate-fade" />
      </div>

      <div className="relative animate-rise space-y-8">
        <header className="space-y-3 text-center">
          <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Bet<span className="text-brand">Local</span>
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            La cuenta sirve para guardar tus apuestas y llevar tu banco entre
            dispositivos. Para consultar las recomendaciones no hace falta.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="h-[340px] rounded-3xl border border-line/80 bg-surface/80" />
          }
        >
          <LoginForm />
        </Suspense>

        <Link
          href="/"
          className="block text-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          Ver recomendaciones sin cuenta
        </Link>

        <p className="text-center text-xs text-ink-faint leading-relaxed">
          BetLocal es una herramienta de análisis estadístico. No es una casa de
          apuestas, no acepta apuestas y no garantiza resultados. +18. Juega con
          responsabilidad.
        </p>
      </div>
    </main>
  );
}
