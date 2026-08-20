-- Esquema de estudio para Estudia (listo para sync de progreso más adelante).
-- El MVP actual guarda el SRS en localStorage; estas tablas permiten
-- sincronizar entre dispositivos cuando se active.

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

-- Perfil de estudio: limpia campos de apuestas si existen y añade meta diaria.
alter table public.profiles
  add column if not exists daily_goal int not null default 15;

alter table public.profiles
  add column if not exists active_course_id text;
