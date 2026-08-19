-- Soporte de base de datos para la ingesta de cuotas.
--
-- Dos piezas: una vista con la última cuota de cada cotización (para no
-- reinsertar snapshots idénticos) y una función que marca la cuota de cierre.

-- ---------------------------------------------------------------------------
-- Última cuota conocida de cada cotización
-- ---------------------------------------------------------------------------

-- `line` es nullable y NULL nunca es igual a NULL, así que agrupar por la
-- columna directamente trataría cada 1X2 como una cotización distinta.
create or replace view public.latest_odds
with (security_invoker = true) as
select distinct on (
    match_id, bookmaker, market, selection, coalesce(line, -9999)
  )
  match_id,
  bookmaker,
  market,
  selection,
  line,
  odds,
  captured_at
from public.odds_snapshots
order by
  match_id,
  bookmaker,
  market,
  selection,
  coalesce(line, -9999),
  captured_at desc;

grant select on public.latest_odds to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cuota de cierre
-- ---------------------------------------------------------------------------

/*
  Marca como cierre el último snapshot anterior al pitido inicial de cada
  cotización. Se hace en la base y no llamando otra vez al proveedor porque la
  información ya está aquí: gastar cuota de API en esto sería tirarla.

  Solo mira partidos ya comenzados y aún sin cierre marcado, así que el coste no
  crece con el histórico y la función es idempotente.
*/
create or replace function public.mark_closing_odds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  with pending as (
    select m.id
    from public.matches m
    where m.kickoff_at <= now()
      and not exists (
        select 1
        from public.odds_snapshots s
        where s.match_id = m.id
          and s.is_closing
      )
  ),
  candidates as (
    select distinct on (
        s.match_id, s.bookmaker, s.market, s.selection, coalesce(s.line, -9999)
      )
      s.id
    from public.odds_snapshots s
    join public.matches m on m.id = s.match_id
    join pending p on p.id = m.id
    where s.captured_at < m.kickoff_at
    order by
      s.match_id,
      s.bookmaker,
      s.market,
      s.selection,
      coalesce(s.line, -9999),
      s.captured_at desc
  )
  update public.odds_snapshots o
  set is_closing = true
  from candidates c
  where o.id = c.id
    and not o.is_closing;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- La ingesta corre con service_role; nadie más necesita esto.
revoke execute on function public.mark_closing_odds() from anon, authenticated, public;
grant execute on function public.mark_closing_odds() to service_role;

-- Acelera la búsqueda de partidos ya comenzados que aún no tienen cierre.
create index if not exists matches_kickoff_status_idx
  on public.matches (kickoff_at desc);
