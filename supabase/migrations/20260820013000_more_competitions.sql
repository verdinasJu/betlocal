-- Amplía el catálogo a las seis ligas que valida el backtest.
--
-- Con una sola liga hay unas diez apuestas por temporada que superen el umbral
-- de EV, que es demasiado poco para saber si la ventaja es real o suerte. Estas
-- seis son las mismas sobre las que se midió la estrategia, así que el tope de
-- cuota y el umbral de EV siguen siendo aplicables.

insert into public.competitions (id, name, country)
values
  ('ESP.1', 'LaLiga',             'ES'),
  ('ESP.2', 'LaLiga Hypermotion', 'ES'),
  ('ENG.1', 'Premier League',     'GB'),
  ('ITA.1', 'Serie A',            'IT'),
  ('GER.1', 'Bundesliga',         'DE'),
  ('FRA.1', 'Ligue 1',            'FR')
on conflict (id) do update
  set name = excluded.name,
      country = excluded.country;
