/**
 * Tipos del dominio de estudio.
 *
 * Flujo pensado para certificar en pocos días:
 *   1) Leer lecciones del tema (conceptos)
 *   2) Jugar / testear ese tema
 *   3) Repasar fallos (SRS + Revancha)
 */

export type CardKind = "mcq" | "tf" | "pair";

export type Lesson = {
  id: string;
  title: string;
  /** Texto sencillo en español, párrafos separados por \n\n */
  body: string;
  sourceUrl?: string;
  sourceLabel?: string;
};

export type StudyCard = {
  id: string;
  topicId: string;
  kind: CardKind;
  prompt: string;
  options?: string[];
  answerIndex?: number;
  answerTrue?: boolean;
  term?: string;
  definition?: string;
  explanation: string;
  sourceUrl?: string;
  sourceLabel?: string;
  difficulty: 1 | 2 | 3;
};

export type Topic = {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  order: number;
  /** Día sugerido del plan de 10 días (1–10). */
  day?: number;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  language: "es";
  examHint?: string;
  topics: Topic[];
  cards: StudyCard[];
};

export type GameModeId =
  | "streak"
  | "blitz"
  | "quiz"
  | "trap"
  | "pairs"
  | "explain"
  | "revenge"
  | "boss";

export type GameMode = {
  id: GameModeId;
  title: string;
  blurb: string;
  seconds: number | null;
  lives: number | null;
  targetCards: number;
};
