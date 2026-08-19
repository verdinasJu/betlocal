"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase } from "@/lib/settings";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = hasSupabase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Supabase todavía no está configurado en este entorno.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Sesión iniciada");
      router.replace(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Cuenta creada");
      router.replace("/onboarding");
      router.refresh();
      return;
    }
    toast.success(
      "Cuenta creada. Si pide confirmación, revisa el email y luego inicia sesión."
    );
    setMode("login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-line/80 bg-surface/80 p-6 shadow-sm backdrop-blur"
    >
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === "login"
              ? "bg-surface-3 text-ink shadow-sm"
              : "text-ink-muted"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === "register"
              ? "bg-surface-3 text-ink shadow-sm"
              : "text-ink-muted"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || !configured}
      >
        {loading
          ? "Un momento…"
          : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
      </Button>

      {!configured && (
        <p className="text-center text-xs text-ink-faint leading-relaxed">
          Las cuentas se activan al configurar Supabase. Mientras tanto la app
          funciona sin registro y tus ajustes se guardan en este dispositivo.
        </p>
      )}
    </form>
  );
}
