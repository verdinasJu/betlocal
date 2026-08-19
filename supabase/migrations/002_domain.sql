-- BetLocal — dominio deportivo
-- Datos de catálogo (equipos, partidos, cuotas, predicciones) son PÚBLICOS en lectura
-- para usuarios autenticados; solo la ingesta (service_role) escribe.
-- Las apuestas del usuario son privadas vía RLS.

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

create table if not exists public.competitions (
  id text primary key,                 -- ej. 'ESP.1'
  name text not null,                  -- 'LaLiga'
  country text not null default 'ES',
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id text primary key,                 -- id interno estable
  name text not null,
  short_name text,
  competition_id text references public.competitions(id) on delete set null,
  -- Mapeo a ids de proveedores externos, para no acoplarse a uno solo
  provider_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id text primary key,
  competition_id text not null references public.competitions(id) on delete cascade,
  season text not null,                -- '2026-27'
  matchday int,
  kickoff_at timestamptz not null,
  home_team_id text not null references public.teams(id),
  away_team_id text not null references public.teams(id),
  status text not null default 'scheduled'
    check (status in ('scheduled','live','finished','postponed','cancelled')),
  home_goals int,
  away_goals int,
  provider_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_kickoff_idx on public.matches (kickoff_at);
create index if not exists matches_competition_season_idx
  on public.matches (competition_id, season);

-- ---------------------------------------------------------------------------
-- Cuotas: histórico completo de snapshots (imprescindible para CLV)
-- ---------------------------------------------------------------------------

create table if not exists public.odds_snapshots (
  id bigserial primary key,
  match_id text not null references public.matches(id) on delete cascade,
  bookmaker text not null,             -- 'pinnacle', 'bet365', 'betfair_ex'
  market text not null,                -- '1x2','totals','ah','btts'
  selection text not null,             -- 'home','draw','away','over','under'
  line numeric(6,2),                   -- 2.5 para totals, -0.5 para AH
  odds numeric(8,3) not null check (odds > 1),
  -- Cuota de cierre: última observada antes del kickoff
  is_closing boolean not null default false,
  captured_at timestamptz not null default now()
);

create index if not exists odds_match_market_idx
  on public.odds_snapshots (match_id, market, bookmaker, captured_at desc);

create index if not exists odds_closing_idx
  on public.odds_snapshots (match_id, is_closing)
  where is_closing;

-- ---------------------------------------------------------------------------
-- Modelo: versionado explícito para poder auditar el histórico
-- ---------------------------------------------------------------------------

create table if not exists public.model_versions (
  id text primary key,                 -- 'dc-v1', 'market-anchored-v2'
  name text not null,
  description text,
  params jsonb not null default '{}'::jsonb,
  trained_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id bigserial primary key,
  match_id text not null references public.matches(id) on delete cascade,
  model_version_id text not null references public.model_versions(id),
  market text not null,
  selection text not null,
  line numeric(6,2),
  fair_prob numeric(8,6) not null check (fair_prob > 0 and fair_prob < 1),
  fair_odds numeric(8,3) not null,
  -- Mejor cuota disponible en el momento del cálculo
  best_odds numeric(8,3),
  best_bookmaker text,
  ev numeric(8,5),                     -- EV por unidad apostada
  score int check (score between 0 and 100),
  -- Sello de integridad: hash del payload, publicado antes del kickoff
  payload_hash text,
  sealed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists predictions_match_idx
  on public.predictions (match_id, model_version_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Apuestas del usuario (privadas)
-- ---------------------------------------------------------------------------

create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text references public.matches(id) on delete set null,
  prediction_id bigint references public.predictions(id) on delete set null,
  bookmaker text not null,
  market text not null,
  selection text not null,
  line numeric(6,2),
  odds_taken numeric(8,3) not null check (odds_taken > 1),
  stake numeric(12,2) not null check (stake > 0),
  -- Cuota de cierre para calcular CLV a posteriori
  closing_odds numeric(8,3),
  status text not null default 'pending'
    check (status in ('pending','won','lost','void','half_won','half_lost','cashout')),
  payout numeric(12,2),
  placed_at timestamptz not null default now(),
  settled_at timestamptz,
  notes text
);

create index if not exists bets_user_placed_idx
  on public.bets (user_id, placed_at desc);

create index if not exists bets_user_status_idx
  on public.bets (user_id, status);

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

alter table public.competitions   enable row level security;
alter table public.teams          enable row level security;
alter table public.matches        enable row level security;
alter table public.odds_snapshots enable row level security;
alter table public.model_versions enable row level security;
alter table public.predictions    enable row level security;
alter table public.bets           enable row level security;

grant select on table public.competitions   to authenticated;
grant select on table public.teams          to authenticated;
grant select on table public.matches        to authenticated;
grant select on table public.odds_snapshots to authenticated;
grant select on table public.model_versions to authenticated;
grant select on table public.predictions    to authenticated;
grant select, insert, update, delete on table public.bets to authenticated;

-- Catálogo: lectura para autenticados, escritura solo service_role (ingesta)
drop policy if exists "competitions_read" on public.competitions;
create policy "competitions_read" on public.competitions
  for select to authenticated using (true);

drop policy if exists "teams_read" on public.teams;
create policy "teams_read" on public.teams
  for select to authenticated using (true);

drop policy if exists "matches_read" on public.matches;
create policy "matches_read" on public.matches
  for select to authenticated using (true);

drop policy if exists "odds_snapshots_read" on public.odds_snapshots;
create policy "odds_snapshots_read" on public.odds_snapshots
  for select to authenticated using (true);

drop policy if exists "model_versions_read" on public.model_versions;
create policy "model_versions_read" on public.model_versions
  for select to authenticated using (true);

drop policy if exists "predictions_read" on public.predictions;
create policy "predictions_read" on public.predictions
  for select to authenticated using (true);

-- Bets: cada usuario solo ve y toca las suyas
drop policy if exists "bets_select_own" on public.bets;
create policy "bets_select_own" on public.bets
  for select using (auth.uid() = user_id);

drop policy if exists "bets_insert_own" on public.bets;
create policy "bets_insert_own" on public.bets
  for insert with check (auth.uid() = user_id);

drop policy if exists "bets_update_own" on public.bets;
create policy "bets_update_own" on public.bets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bets_delete_own" on public.bets;
create policy "bets_delete_own" on public.bets
  for delete using (auth.uid() = user_id);

-- Semilla mínima
insert into public.competitions (id, name, country)
values ('ESP.1', 'LaLiga', 'ES')
on conflict (id) do nothing;
