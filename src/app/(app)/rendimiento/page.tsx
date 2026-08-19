import { Card, CardContent } from "@/components/ui/card";

export default function PerformancePage() {
  return (
    <main className="animate-rise space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Rendimiento</h1>
        <p className="text-sm text-ink-muted">
          ROI, yield, CLV medio y calibración del modelo
        </p>
      </header>

      <Card>
        <CardContent className="space-y-2">
          <p className="text-sm font-semibold text-ink">Sin histórico</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Con menos de unos cientos de apuestas el ROI no distingue habilidad
            de suerte. Aquí se mostrarán además Brier score y RPS del modelo,
            que sí convergen rápido.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
