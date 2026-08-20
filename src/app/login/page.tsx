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
            Estudia
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            La cuenta es opcional. El progreso de estudio ya se guarda en este
            dispositivo; con cuenta podrás sincronizarlo más adelante.
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
          Empezar a estudiar sin cuenta
        </Link>

        <p className="text-center text-xs text-ink-faint leading-relaxed">
          Estudia es una herramienta de práctica. El contenido de Salesforce es
          material de estudio original con enlaces a fuentes públicas, no dumps
          de examen.
        </p>
      </div>
    </main>
  );
}
