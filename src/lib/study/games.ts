import type { GameMode } from "@/lib/study/types";

export const GAME_MODES: GameMode[] = [
  {
    id: "streak",
    title: "Racha",
    blurb: "3 vidas. No rompas la racha.",
    seconds: null,
    lives: 3,
    targetCards: 15,
  },
  {
    id: "blitz",
    title: "Contrarreloj",
    blurb: "60 segundos. Cuantas más, mejor.",
    seconds: 60,
    lives: null,
    targetCards: 40,
  },
  {
    id: "quiz",
    title: "Duelo de opciones",
    blurb: "Test clásico, sin prisas.",
    seconds: null,
    lives: null,
    targetCards: 12,
  },
  {
    id: "trap",
    title: "Verdadero o trampa",
    blurb: "Afirmaciones con gancho. Caza el error.",
    seconds: null,
    lives: null,
    targetCards: 12,
  },
  {
    id: "pairs",
    title: "Parejas",
    blurb: "Empareja término y definición.",
    seconds: 90,
    lives: null,
    targetCards: 6,
  },
  {
    id: "explain",
    title: "Explica y comprueba",
    blurb: "Lees el concepto y luego te examinas.",
    seconds: null,
    lives: null,
    targetCards: 8,
  },
  {
    id: "revenge",
    title: "Revancha",
    blurb: "Solo lo que fallaste. Cierra agujeros.",
    seconds: null,
    lives: null,
    targetCards: 12,
  },
  {
    id: "boss",
    title: "Jefe de tema",
    blurb: "5 fichas difíciles. Sensación de boss fight.",
    seconds: null,
    lives: 2,
    targetCards: 5,
  },
];

export function modeById(id: string): GameMode | undefined {
  return GAME_MODES.find((m) => m.id === id);
}
