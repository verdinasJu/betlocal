"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/SignOutButton";
import { useUser } from "@/hooks/useUser";

export function AccountCard() {
  const { user, loading, configured } = useUser();

  if (!configured) {
    return (
      <Card>
        <CardContent className="space-y-2">
          <p className="text-sm font-semibold text-ink">Sin cuenta</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Las cuentas se activarán al conectar la base de datos. Ahora mismo
            tus ajustes se guardan solo en este dispositivo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) return null;

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold text-ink">Sin cuenta</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Tus ajustes se guardan solo en este dispositivo. Con cuenta se
            sincronizan entre móvil y ordenador, y puedes registrar tus apuestas
            para medir el CLV.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Entrar o crear cuenta
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">Cuenta</span>
          <span className="truncate text-sm font-semibold text-ink">
            {user.email}
          </span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Tu banco y tus filtros se sincronizan con esta cuenta.
        </p>
        <SignOutButton />
      </CardContent>
    </Card>
  );
}
