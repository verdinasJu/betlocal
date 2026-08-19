import { Card, CardContent } from "@/components/ui/card";

export default function BetsPage() {
  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mis apuestas</h1>
        <p className="text-sm text-ink-muted">
          Registro manual de lo que apuestas y a qué cuota
        </p>
      </header>

      <Card>
        <CardContent className="space-y-2">
          <p className="text-sm font-semibold text-ink">Aún no hay apuestas</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Cuando registres una apuesta se guardará la cuota tomada para poder
            compararla después con la cuota de cierre (CLV), que es la métrica
            más fiable para saber si realmente tienes ventaja.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
