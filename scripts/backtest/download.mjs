/**
 * Descarga el histórico de LaLiga desde Football-Data.co.uk.
 *
 * Es la fuente gratuita con cuotas de apertura y cierre de varias casas, lo que
 * permite backtestear sin pagar ninguna API. Los CSV no cambian una vez cerrada
 * la temporada, así que se cachean en disco y solo se refresca la temporada en
 * curso.
 *
 *   node scripts/backtest/download.mjs [--force] [--division SP1,SP2]
 */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const RAW_DIR = join(process.cwd(), "data", "raw");
const BASE = "https://www.football-data.co.uk/mmz4281";

/** Temporadas en el formato de la web: '1213' = 2012/13. */
function seasonCodes(fromStartYear, toStartYear) {
  const codes = [];
  for (let y = fromStartYear; y <= toStartYear; y++) {
    const a = String(y % 100).padStart(2, "0");
    const b = String((y + 1) % 100).padStart(2, "0");
    codes.push(`${a}${b}`);
  }
  return codes;
}

/**
 * Pinnacle aparece en los CSV desde 2012/13; antes solo hay casas soft, que no
 * sirven como ancla de mercado eficiente.
 */
const FIRST_SEASON = 2012;

function currentSeasonStartYear(now = new Date()) {
  // Las ligas europeas arrancan en agosto: hasta julio seguimos en la anterior.
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const divArg = args.find((a) => a.startsWith("--division"));
const divisions = divArg
  ? (divArg.split("=")[1] ?? args[args.indexOf(divArg) + 1] ?? "SP1").split(",")
  : ["SP1"];

const CURRENT = currentSeasonStartYear();
const seasons = seasonCodes(FIRST_SEASON, CURRENT);

async function exists(path) {
  try {
    const s = await stat(path);
    return s.size > 0;
  } catch {
    return false;
  }
}

async function download(division, season) {
  const name = `${division}_${season}.csv`;
  const dest = join(RAW_DIR, name);
  const isCurrent = season === seasons[seasons.length - 1];

  if (!force && !isCurrent && (await exists(dest))) {
    return { name, status: "cache" };
  }

  const url = `${BASE}/${season}/${division}.csv`;
  const res = await fetch(url);
  if (!res.ok) {
    return { name, status: `error ${res.status}` };
  }

  const text = await res.text();
  // Una temporada aún no publicada devuelve una página vacía o casi.
  if (text.length < 200) {
    return { name, status: "vacio" };
  }

  await writeFile(dest, text, "utf8");
  const rows = text.trim().split("\n").length - 1;
  return { name, status: `ok (${rows} partidos)` };
}

await mkdir(RAW_DIR, { recursive: true });

for (const division of divisions) {
  for (const season of seasons) {
    const { name, status } = await download(division, season);
    console.log(`${name.padEnd(16)} ${status}`);
  }
}
