-- Estudia: perfiles + dominio de estudio.
-- Sustituye el esquema antiguo de apuestas (BetLocal).

-- Perfiles (estudio)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  daily_goal int not null default 15,
  active_course_id text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si venía de BetLocal, limpia columnas de apuestas si existen.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'bankroll'
  ) then
    alter table public.profiles
      drop column if exists bankroll,
      drop column if exists initial_bankroll,
      drop column if exists currency,
      drop column if exists kelly_fraction,
      drop column if exists max_stake_pct,
      drop column if exists min_ev_pct,
      drop column if exists min_odds,
      drop column if exists max_odds,
      drop column if exists onboarding_completed_at;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'daily_goal'
  ) then
    alter table public.profiles add column daily_goal int not null default 15;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'active_course_id'
  ) then
    alter table public.profiles add column active_course_id text;
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from anon, authenticated, public;
grant execute on function public.handle_new_user() to postgres, service_role;

alter table public.profiles enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cursos / temas / fichas / progreso
create table if not exists public.study_courses (
  id text primary key,
  title text not null,
  short_title text not null,
  description text not null default '',
  language text not null default 'es',
  created_at timestamptz not null default now()
);

create table if not exists public.study_topics (
  id text primary key,
  course_id text not null references public.study_courses(id) on delete cascade,
  title text not null,
  summary text not null default '',
  sort_order int not null default 0
);

create table if not exists public.study_cards (
  id text primary key,
  topic_id text not null references public.study_topics(id) on delete cascade,
  kind text not null check (kind in ('mcq', 'tf', 'pair')),
  prompt text not null,
  payload jsonb not null default '{}'::jsonb,
  explanation text not null default '',
  source_url text,
  source_label text,
  difficulty int not null default 1 check (difficulty between 1 and 3)
);

create table if not exists public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.study_cards(id) on delete cascade,
  ease numeric(4,2) not null default 2.3,
  interval_days int not null default 0,
  due_at date not null default current_date,
  reps int not null default 0,
  lapses int not null default 0,
  correct int not null default 0,
  wrong int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

alter table public.study_courses enable row level security;
alter table public.study_topics enable row level security;
alter table public.study_cards enable row level security;
alter table public.study_progress enable row level security;

grant select on table public.study_courses to anon, authenticated;
grant select on table public.study_topics to anon, authenticated;
grant select on table public.study_cards to anon, authenticated;
grant select, insert, update, delete on table public.study_progress to authenticated;

drop policy if exists "study_courses_read" on public.study_courses;
create policy "study_courses_read" on public.study_courses
  for select to anon, authenticated using (true);

drop policy if exists "study_topics_read" on public.study_topics;
create policy "study_topics_read" on public.study_topics
  for select to anon, authenticated using (true);

drop policy if exists "study_cards_read" on public.study_cards;
create policy "study_cards_read" on public.study_cards
  for select to anon, authenticated using (true);

drop policy if exists "study_progress_own" on public.study_progress;
create policy "study_progress_own" on public.study_progress
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tirar el dominio de apuestas si aún existe en el proyecto Supabase.
drop view if exists public.latest_odds cascade;
drop function if exists public.mark_closing_odds() cascade;

drop table if exists public.bets cascade;
drop table if exists public.predictions cascade;
drop table if exists public.model_versions cascade;
drop table if exists public.odds_snapshots cascade;
drop table if exists public.matches cascade;
drop table if exists public.teams cascade;
drop table if exists public.competitions cascade;
