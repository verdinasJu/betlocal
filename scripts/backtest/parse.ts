/**
 * Lectura y normalización de los CSV de Football-Data.co.uk.
 *
 * El formato cambia con los años: hasta 2018/19 las cuotas agregadas venían de
 * Betbrain (`BbMxH`, `BbAvH`) y no existía la cuota de cierre agregada; desde
 * 2019/20 son `MaxH`/`AvgH` con sus equivalentes de cierre `MaxCH`/`AvgCH`.
 * Aquí se unifica todo en una estructura estable para que el motor de backtest
 * no tenga que saber nada de esto.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Outcome = 0 | 1 | 2; // local, empate, visitante

/** Tripleta 1X2 en el orden [local, empate, visitante]. */
export type Triplet = [number, number, number];

export type PriceSet = {
  /** Pinnacle: la casa sharp de referencia del sector. */
  pinnacle?: Triplet;
  /** Mejor cuota disponible del mercado (máximo entre casas). */
  best?: Triplet;
  /** Media del mercado: lo que consigue quien no compara precios. */
  avg?: Triplet;
  /** Bet365: casa soft de referencia, accesible en España. */
  b365?: Triplet;
  /** Betfair Exchange (cuotas ya netas de comisión no; brutas). */
  exchange?: Triplet;
};

export type MatchRow = {
  season: string;
  date: Date;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  outcome: Outcome;
  /** Cuotas de apertura (primera publicada, días antes). */
  open: PriceSet;
  /** Cuotas de cierre (últimas antes del pitido inicial). */
  close: PriceSet;
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Las fechas vienen como dd/mm/yy o dd/mm/yyyy según la temporada.
 * Interpretar mal el año partiría el orden cronológico, que es justo lo que
 * garantiza que el backtest no mire al futuro.
 */
function parseDate(raw: string): Date | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  let year = Number(parts[2]);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }
  if (year < 100) year += year < 70 ? 2000 : 1900;
  return new Date(Date.UTC(year, month - 1, day));
}

function num(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Una tripleta solo es utilizable si las tres cuotas existen y son > 1.
 * Devolver una tripleta parcial haría que el devig calculara un overround
 * falso y generase valor de la nada.
 */
function triplet(
  get: (col: string) => string | undefined,
  cols: [string, string, string]
): Triplet | undefined {
  const h = num(get(cols[0]));
  const d = num(get(cols[1]));
  const a = num(get(cols[2]));
  if (h === undefined || d === undefined || a === undefined) return undefined;
  if (h <= 1 || d <= 1 || a <= 1) return undefined;
  return [h, d, a];
}

/** Primera variante de nombres que exista en la fila. */
function firstTriplet(
  get: (col: string) => string | undefined,
  variants: [string, string, string][]
): Triplet | undefined {
  for (const v of variants) {
    const t = triplet(get, v);
    if (t) return t;
  }
  return undefined;
}

function outcomeFrom(ftr: string, hg: number, ag: number): Outcome {
  const r = ftr.trim().toUpperCase();
  if (r === "H") return 0;
  if (r === "D") return 1;
  if (r === "A") return 2;
  return hg > ag ? 0 : hg === ag ? 1 : 2;
}

export function parseCsv(season: string, content: string): MatchRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: MatchRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const get = (col: string) => {
      const idx = header.indexOf(col);
      return idx === -1 ? undefined : cells[idx];
    };

    const date = parseDate(get("Date") ?? "");
    const home = get("HomeTeam")?.trim();
    const away = get("AwayTeam")?.trim();
    const hg = num(get("FTHG"));
    const ag = num(get("FTAG"));

    // Partido sin jugar o fila de relleno al final del fichero.
    if (!date || !home || !away || hg === undefined || ag === undefined) continue;

    rows.push({
      season,
      date,
      home,
      away,
      homeGoals: hg,
      awayGoals: ag,
      outcome: outcomeFrom(get("FTR") ?? "", hg, ag),
      open: {
        pinnacle: firstTriplet(get, [
          ["PSH", "PSD", "PSA"],
          ["PH", "PD", "PA"],
        ]),
        best: firstTriplet(get, [
          ["MaxH", "MaxD", "MaxA"],
          ["BbMxH", "BbMxD", "BbMxA"],
        ]),
        avg: firstTriplet(get, [
          ["AvgH", "AvgD", "AvgA"],
          ["BbAvH", "BbAvD", "BbAvA"],
        ]),
        b365: triplet(get, ["B365H", "B365D", "B365A"]),
        exchange: triplet(get, ["BFEH", "BFED", "BFEA"]),
      },
      close: {
        pinnacle: triplet(get, ["PSCH", "PSCD", "PSCA"]),
        best: triplet(get, ["MaxCH", "MaxCD", "MaxCA"]),
        avg: triplet(get, ["AvgCH", "AvgCD", "AvgCA"]),
        b365: triplet(get, ["B365CH", "B365CD", "B365CA"]),
        exchange: triplet(get, ["BFECH", "BFECD", "BFECA"]),
      },
    });
  }

  return rows;
}

/**
 * Carga todos los CSV de `data/raw` ordenados cronológicamente.
 * Lectura síncrona a propósito: es una herramienta de línea de comandos y así
 * el script puede ser plano, sin envolverlo todo en una función async.
 */
export function loadMatches(division = "SP1"): MatchRow[] {
  const dir = join(process.cwd(), "data", "raw");
  const files = readdirSync(dir)
    .filter((f) => f.startsWith(`${division}_`) && f.endsWith(".csv"))
    .sort();

  const all: MatchRow[] = [];
  for (const file of files) {
    const season = file.replace(`${division}_`, "").replace(".csv", "");
    all.push(...parseCsv(season, readFileSync(join(dir, file), "utf8")));
  }

  return all.sort((a, b) => a.date.getTime() - b.date.getTime());
}
