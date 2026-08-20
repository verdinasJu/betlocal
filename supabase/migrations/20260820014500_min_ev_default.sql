-- Baja el umbral de EV por defecto del 2% al 1%.
--
-- Es una decisión de volumen, no de agresividad. Apostando en una sola casa las
-- oportunidades son escasas: el backtest sobre el escenario de Bet365 con cuota
-- de cierre encuentra unas diez apuestas por temporada y liga al 2%, y el doble
-- al 1% sin que el ROI medido empeore. Con muestras tan pequeñas, no llegar
-- nunca a tener datos es peor que aceptar valor más ajustado.

alter table public.profiles
  alter column min_ev_pct set default 1;

update public.profiles
set min_ev_pct = 1,
    updated_at = now()
where min_ev_pct = 2;
