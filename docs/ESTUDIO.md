# Bases de estudio de Estudia

La app no es un PDF con adornos. Cada modo de juego está atado a un principio
de aprendizaje que la investigación ya tiene bastante claro. Si un minijuego no
empuja alguno de estos, no entra.

## Principios (el “motor” invisible)

1. **Recuerdo activo** — tienes que sacar la respuesta de la cabeza, no
   releer. Por eso casi todo es pregunta primero y explicación después.
2. **Repetición espaciada (SRS)** — lo que fallas vuelve pronto; lo que
   aciertas se alarga (algoritmo tipo SM-2 ligero). El modo *Hoy* vive de esto.
3. **Feedback inmediato** — al fallar ves *por qué* en 1–3 frases y, si hay,
   el enlace a Trailhead / doc oficial.
4. **Dificultad deseable** — un poco de presión (tiempo, vidas, racha) mejora
   la retención; demasiado la mata. Los modos tienen límites cortos.
5. **Intercalado** — mezclar temas del mismo curso en una partida, no bloquear
   solo un capítulo hasta el aburrimiento.
6. **Sesiones cortas** — meta diaria de 10–20 fichas. Mejor cada día que
   maratones de domingo.
7. **Práctica de recuperación + elaboración** — tras acertar o fallar, la
   explicación corta obliga a conectar el concepto (no solo “verde/rojo”).

## Unidades de contenido

| Capa | Ejemplo |
|------|---------|
| **Curso** | Salesforce Admin (ES) |
| **Tema** | Usuarios y seguridad |
| **Ficha** | Pregunta, V/F, par término↔definición, o mini-explicación |

Cada ficha lleva: enunciado, respuesta, explicación, dificultad, y opcionalmente
`sourceUrl` (Trailhead u otra fuente pública). **No** usamos dumps del examen
oficial: son ilegales y además enseñan a memorizar trampas, no el producto.

## Modos de juego

| Modo | Cómo se juega | Qué entrena |
|------|---------------|-------------|
| **Racha** | 3 vidas. Cada acierto suma racha; al fallar bajas una vida. | Recuperación bajo presión suave |
| **Contrarreloj** | 60 segundos, tantas fichas como puedas. | Fluidez / reconocimiento rápido |
| **Duelo de opciones** | Test clásico 4 opciones, sin reloj. | Precisión y lectura del enunciado |
| **Verdadero o trampa** | Afirmaciones que parecen ciertas pero tienen un gancho. | Discriminar matices (muy SF Admin) |
| **Parejas** | Empareja término ↔ definición en un grid. | Vocabulario del producto |
| **Explica y comprueba** | Lees 30–60 s de concepto → luego 1–2 preguntas de ese bloque. | Elaboración + comprobación |
| **Revancha** | Solo fichas que fallaste. | Cerrar agujeros |
| **Jefe de tema** | 5 fichas difíciles del tema cuando el SRS lo marca “caliente”. | Sensación de logro + consolidación |

La puntuación de partida (XP, racha máxima) es cosmético. Lo que importa para
el progreso real es el **SRS** y el % por tema.

## Flujo diario recomendado

1. Abrir **Hoy** → hacer las fichas “debido”.
2. Si aún tienes ganas, un modo juego (Contrarreloj o Racha).
3. Antes del examen: **Revancha** + **Jefe** de los temas flojos.

## Cómo se añade materia nueva

Packs en `content/` (JSON) versionados en el repo. Cuando quieras Developer I o
una asignatura de Psicología: mismo esquema, otro pack. Opcionalmente más
adelante Supabase para sincronizar progreso entre dispositivos.
