# Estudia

App móvil (PWA) para estudiar certificaciones y asignaturas con **tests, juegos
y repetición espaciada**. Stack: Next.js + Supabase + Vercel.

## Cómo se usa

1. **Aprender**: lee las lecciones del día (conceptos en español sencillo).
2. **Practicar / Jugar**: test, racha, trampas, parejas…
3. **Progreso / Revancha**: cierra agujeros antes del examen.

No usamos dumps de sitios tipo FreeCram (van contra las reglas de Salesforce).
Las preguntas son **práctica original** sobre los mismos temas del exam guide.

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
