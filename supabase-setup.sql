-- ============================================================
-- Perdidos Algures — Supabase schema
-- Corre isto no SQL Editor do teu projeto Supabase.
-- ============================================================

-- Utilizadores (auth própria: nome + password hash)
create table if not exists pa_users (
  id          text primary key,
  name        text unique not null,
  initials    text,
  color       text,
  photo_url   text,
  pass_hash   text not null,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- Edição atual (nome, subtítulo, número)
create table if not exists pa_edition (
  id        int primary key default 1,
  title     text default 'Nova Aventura',
  subtitle  text default 'Algures no mundo.',
  number    int  default 1
);
insert into pa_edition (id) values (1) on conflict do nothing;

-- RSVP por utilizador
create table if not exists pa_rsvp (
  user_id    text primary key references pa_users(id) on delete cascade,
  status     text check (status in ('in','out','maybe')),
  updated_at timestamptz default now()
);

-- Sugestões de localização
create table if not exists pa_loc_suggestions (
  id         text primary key,
  name       text not null,
  city       text,
  tags       text[],
  accent     text,
  by_user    text references pa_users(id) on delete set null,
  created_at timestamptz default now()
);

-- Vencedor da votação de local
create table if not exists pa_loc_winner (
  id            int primary key default 1,
  suggestion_id text references pa_loc_suggestions(id) on delete set null
);

-- Sugestões de alojamento
create table if not exists pa_acc_suggestions (
  id         text primary key,
  type       text,
  price      int,
  area       text,
  link       text,
  note       text,
  by_user    text references pa_users(id) on delete set null,
  created_at timestamptz default now()
);

-- Vencedor da votação de alojamento
create table if not exists pa_acc_winner (
  id            int primary key default 1,
  suggestion_id text references pa_acc_suggestions(id) on delete set null
);

-- Votos (fase 3 = localização, fase 5 = alojamento)
create table if not exists pa_votes (
  user_id       text not null,
  phase_key     text not null,  -- 'loc' ou 'acc'
  suggestion_id text not null,
  updated_at    timestamptz default now(),
  primary key (user_id, phase_key)
);

-- Disponibilidade por utilizador
create table if not exists pa_availability (
  user_id    text primary key,
  days       int[],
  updated_at timestamptz default now()
);

-- Datas trancadas pelo admin
create table if not exists pa_locked_dates (
  id          int primary key default 1,
  from_day    int,
  to_day      int,
  month_label text
);

-- Chat
create table if not exists pa_chat (
  id         bigint generated always as identity primary key,
  who        text not null,
  text       text not null,
  created_at timestamptz default now()
);

-- ── Realtime ────────────────────────────────────────────────
-- Ativa o Realtime para as tabelas que precisam de sync em direto.
alter publication supabase_realtime add table pa_chat;
alter publication supabase_realtime add table pa_rsvp;
alter publication supabase_realtime add table pa_loc_suggestions;
alter publication supabase_realtime add table pa_acc_suggestions;
alter publication supabase_realtime add table pa_availability;
alter publication supabase_realtime add table pa_loc_winner;
alter publication supabase_realtime add table pa_acc_winner;
alter publication supabase_realtime add table pa_locked_dates;
alter publication supabase_realtime add table pa_users;

-- ── Row Level Security ──────────────────────────────────────
-- A app usa a anon key para tudo — políticas permissivas para
-- o grupo fechado (sem dados sensíveis de terceiros).
alter table pa_users           enable row level security;
alter table pa_edition         enable row level security;
alter table pa_rsvp            enable row level security;
alter table pa_loc_suggestions enable row level security;
alter table pa_loc_winner      enable row level security;
alter table pa_votes           enable row level security;
alter table pa_acc_suggestions enable row level security;
alter table pa_acc_winner      enable row level security;
alter table pa_availability    enable row level security;
alter table pa_locked_dates    enable row level security;
alter table pa_chat            enable row level security;

create policy "pa_users_all"           on pa_users           for all to anon using (true) with check (true);
create policy "pa_edition_all"         on pa_edition         for all to anon using (true) with check (true);
create policy "pa_rsvp_all"            on pa_rsvp            for all to anon using (true) with check (true);
create policy "pa_loc_suggestions_all" on pa_loc_suggestions for all to anon using (true) with check (true);
create policy "pa_loc_winner_all"      on pa_loc_winner      for all to anon using (true) with check (true);
create policy "pa_votes_all"           on pa_votes           for all to anon using (true) with check (true);
create policy "pa_acc_suggestions_all" on pa_acc_suggestions for all to anon using (true) with check (true);
create policy "pa_acc_winner_all"      on pa_acc_winner      for all to anon using (true) with check (true);
create policy "pa_availability_all"    on pa_availability    for all to anon using (true) with check (true);
create policy "pa_locked_dates_all"    on pa_locked_dates    for all to anon using (true) with check (true);
create policy "pa_chat_all"            on pa_chat            for all to anon using (true) with check (true);
