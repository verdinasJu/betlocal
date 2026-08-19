-- Limpieza de snapshots duplicados.
--
-- La primera versión de la ingesta leía las cuotas previas sin paginar, así que
-- PostgREST le devolvía solo las primeras 1000 filas y el resto parecían nuevas
-- en cada pasada. Resultado: filas consecutivas con la misma cuota, que no
-- aportan nada al histórico y estorban al calcular el CLV.
--
-- Elimina solo los duplicados consecutivos: conserva la primera aparición de
-- cada precio, que es la que marca cuándo cambió realmente la cuota. Es
-- idempotente, así que no hace nada si no hay duplicados.

with ordenados as (
  select
    id,
    odds,
    lag(odds) over (
      partition by match_id, bookmaker, market, selection, coalesce(line, -9999)
      order by captured_at, id
    ) as odds_anterior
  from public.odds_snapshots
)
delete from public.odds_snapshots s
using ordenados o
where s.id = o.id
  and o.odds_anterior is not null
  and o.odds_anterior = o.odds
  -- Nunca borrar una cuota de cierre: es el dato de referencia del CLV.
  and not s.is_closing;
