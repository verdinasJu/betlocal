import { TodayView } from "@/components/TodayView";
import { loadFixturesFromDb } from "@/lib/fixtures-db";
import { DEMO_FIXTURES } from "@/lib/demo-fixtures";

// Las cuotas cambian cada pocas horas; servir una versión cacheada haría que la
// app recomendara precios que ya no existen.
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const fixtures = await loadFixturesFromDb();
  const isDemo = fixtures.length === 0;

  return (
    <TodayView fixtures={isDemo ? DEMO_FIXTURES : fixtures} isDemo={isDemo} />
  );
}
