-- Ajusta los filtros de cuota por defecto según el backtest (docs/BACKTEST.md).
--
-- Sobre 14 temporadas y seis ligas, apostar a cuotas por encima de 3.5 da ROI
-- negativo de forma consistente aunque el EV calculado sea alto: es el sesgo
-- favorito/longshot. El tope anterior de 6.00 apuntaba justo a la zona que
-- pierde dinero. La cuota mínima baja de 1.50 a 1.20 porque el tramo 1.2–1.5
-- resultó rentable y el filtro lo estaba descartando sin motivo.

alter table public.profiles
  alter column min_odds set default 1.2,
  alter column max_odds set default 3.5;

-- Solo se reencuadran los perfiles que aún tenían los valores por defecto
-- antiguos: si alguien los ha tocado a mano, su elección se respeta.
update public.profiles
set min_odds = 1.2,
    max_odds = 3.5,
    updated_at = now()
where min_odds = 1.5
  and max_odds = 6;
