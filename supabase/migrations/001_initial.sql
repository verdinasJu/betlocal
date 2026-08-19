-- BetLocal — esquema inicial (auth + perfil de apostante)
-- Pegar en Supabase → SQL Editor → Run

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  bankroll numeric(12,2) not null default 0,
  initial_bankroll numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  -- Gestión de riesgo
  kelly_fraction numeric(4,3) not null default 0.25
    check (kelly_fraction > 0 and kelly_fraction <= 1),
  max_stake_pct numeric(5,2) not null default 2
    check (max_stake_pct > 0 and max_stake_pct <= 100),
  -- Filtros de valor
  min_ev_pct numeric(5,2) not null default 2,
  min_odds numeric(6,3) not null default 1.5,
  max_odds numeric(6,3) not null default 6,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
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

-- Solo el trigger (service role) debe poder ejecutarla
revoke execute on function public.handle_new_user() from anon, authenticated, public;
grant execute on function public.handle_new_user() to postgres, service_role;

-- RLS
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
