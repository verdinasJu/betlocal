# Estudia

App móvil (PWA) para estudiar certificaciones y asignaturas con **tests, juegos
y repetición espaciada**. Stack: Next.js + Supabase + Vercel.

## Cómo se usa

1. Abre la app en el móvil y añade acceso directo (PWA).
2. En **Hoy**, cumple la meta diaria de fichas.
3. En **Jugar**, elige un modo (Racha, Contrarreloj, Parejas…).
4. En **Progreso**, mira qué temas fallas y abre **Revancha**.

Curso inicial: **Salesforce Administrator** (español), práctica original con
enlaces a Trailhead. No son dumps del examen.

## Stack

- Next.js 14 + TypeScript + Tailwind
- Progreso SRS en `localStorage` (sync Supabase preparado en migraciones)
- Auth Supabase opcional

## Bases de estudio y modos

Ver [`docs/ESTUDIO.md`](./docs/ESTUDIO.md).

## Desarrollo

```bash
npm install
npm run dev
npm run icons   # regenera iconos PWA desde public/icons/icon.svg
```

## Añadir contenido

Edita o crea un pack en `src/lib/study/content.ts` (curso → temas → fichas) y
regístralo en `COURSES`. Tipos: `mcq`, `tf`, `pair`.
