/**
 * Tipos del dominio de estudio.
 *
 * Curso → temas → fichas. Los modos de juego solo eligen un subconjunto de
 * fichas y una regla de sesión; no inventan contenido.
 */

export type CardKind = "mcq" | "tf" | "pair";

export type StudyCard = {
  id: string;
  topicId: string;
  kind: CardKind;
  /** Enunciado o afirmación. */
  prompt: string;
  /** Opciones para mcq (exactamente una correcta). */
  options?: string[];
  answerIndex?: number;
  /** Para verdadero/falso. */
  answerTrue?: boolean;
  /** Para emparejar. */
  term?: string;
  definition?: string;
  /** Feedback tras responder. */
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
  /** Segundos; null = sin reloj global. */
  seconds: number | null;
  lives: number | null;
  /** Cuántas fichas pide la partida (pairs usa pares). */
  targetCards: number;
};
