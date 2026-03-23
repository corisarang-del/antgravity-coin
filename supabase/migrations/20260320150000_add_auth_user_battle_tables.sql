create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1,
  title text not null default '개미',
  xp integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.battle_snapshots (
  snapshot_id uuid primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  battle_id uuid unique,
  coin_id text not null,
  market_data_json jsonb,
  summary_json jsonb,
  messages_json jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now(),
  expires_at timestamptz not null,
  import_source text not null default 'live',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.battle_sessions (
  battle_id uuid primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_id uuid not null references public.battle_snapshots(snapshot_id) on delete cascade,
  coin_id text not null,
  coin_symbol text not null,
  selected_team text not null check (selected_team in ('bull', 'bear')),
  timeframe text not null check (timeframe in ('5m', '30m', '1h', '4h', '24h', '7d')),
  selected_price numeric not null,
  selected_at timestamptz not null,
  settlement_at timestamptz not null,
  price_source text not null default 'bybit-linear',
  market_symbol text not null,
  settled_price numeric,
  status text not null default 'pending' check (status in ('pending', 'settled', 'merged_legacy')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.battle_outcomes (
  battle_id uuid primary key references public.battle_sessions(battle_id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  winning_team text not null check (winning_team in ('bull', 'bear', 'draw')),
  price_change_percent numeric not null,
  user_won boolean not null,
  strongest_winning_argument text not null,
  weakest_losing_argument text not null,
  report_json jsonb not null default '{}'::jsonb,
  rule_version text not null default 'v1',
  created_at timestamptz not null default now()
);

create table if not exists public.character_memory_seeds (
  id text primary key,
  battle_id uuid not null references public.battle_sessions(battle_id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  team text not null check (team in ('bull', 'bear')),
  summary text not null,
  indicator_label text not null,
  indicator_value text not null,
  provider text not null,
  model text not null,
  fallback_used boolean not null default false,
  was_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.player_decision_seeds (
  battle_id uuid primary key references public.battle_sessions(battle_id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_id uuid references public.battle_snapshots(snapshot_id) on delete set null,
  selected_team text not null check (selected_team in ('bull', 'bear')),
  timeframe text not null check (timeframe in ('5m', '30m', '1h', '4h', '24h', '7d')),
  selected_price numeric not null,
  settlement_at timestamptz not null,
  price_source text not null default 'bybit-linear',
  market_symbol text not null,
  settled_price numeric,
  user_won boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_recent_coins (
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, coin_id)
);

alter table public.user_profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.battle_snapshots enable row level security;
alter table public.battle_sessions enable row level security;
alter table public.battle_outcomes enable row level security;
alter table public.character_memory_seeds enable row level security;
alter table public.player_decision_seeds enable row level security;
alter table public.user_recent_coins enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own" on public.user_profiles for select using (auth.uid() = user_id);
drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own" on public.user_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own" on public.user_profiles for update using (auth.uid() = user_id);

drop policy if exists "progress_select_own" on public.user_progress;
create policy "progress_select_own" on public.user_progress for select using (auth.uid() = user_id);
drop policy if exists "progress_insert_own" on public.user_progress;
create policy "progress_insert_own" on public.user_progress for insert with check (auth.uid() = user_id);
drop policy if exists "progress_update_own" on public.user_progress;
create policy "progress_update_own" on public.user_progress for update using (auth.uid() = user_id);

drop policy if exists "snapshots_select_own" on public.battle_snapshots;
create policy "snapshots_select_own" on public.battle_snapshots for select using (auth.uid() = owner_user_id);
drop policy if exists "snapshots_insert_own" on public.battle_snapshots;
create policy "snapshots_insert_own" on public.battle_snapshots for insert with check (auth.uid() = owner_user_id);
drop policy if exists "snapshots_update_own" on public.battle_snapshots;
create policy "snapshots_update_own" on public.battle_snapshots for update using (auth.uid() = owner_user_id);

drop policy if exists "sessions_select_own" on public.battle_sessions;
create policy "sessions_select_own" on public.battle_sessions for select using (auth.uid() = owner_user_id);
drop policy if exists "sessions_insert_own" on public.battle_sessions;
create policy "sessions_insert_own" on public.battle_sessions for insert with check (auth.uid() = owner_user_id);
drop policy if exists "sessions_update_own" on public.battle_sessions;
create policy "sessions_update_own" on public.battle_sessions for update using (auth.uid() = owner_user_id);

drop policy if exists "outcomes_select_own" on public.battle_outcomes;
create policy "outcomes_select_own" on public.battle_outcomes for select using (auth.uid() = owner_user_id);
drop policy if exists "outcomes_insert_own" on public.battle_outcomes;
create policy "outcomes_insert_own" on public.battle_outcomes for insert with check (auth.uid() = owner_user_id);
drop policy if exists "outcomes_update_own" on public.battle_outcomes;
create policy "outcomes_update_own" on public.battle_outcomes for update using (auth.uid() = owner_user_id);

drop policy if exists "memory_select_own" on public.character_memory_seeds;
create policy "memory_select_own" on public.character_memory_seeds for select using (auth.uid() = owner_user_id);
drop policy if exists "memory_insert_own" on public.character_memory_seeds;
create policy "memory_insert_own" on public.character_memory_seeds for insert with check (auth.uid() = owner_user_id);
drop policy if exists "memory_update_own" on public.character_memory_seeds;
create policy "memory_update_own" on public.character_memory_seeds for update using (auth.uid() = owner_user_id);

drop policy if exists "decision_select_own" on public.player_decision_seeds;
create policy "decision_select_own" on public.player_decision_seeds for select using (auth.uid() = owner_user_id);
drop policy if exists "decision_insert_own" on public.player_decision_seeds;
create policy "decision_insert_own" on public.player_decision_seeds for insert with check (auth.uid() = owner_user_id);
drop policy if exists "decision_update_own" on public.player_decision_seeds;
create policy "decision_update_own" on public.player_decision_seeds for update using (auth.uid() = owner_user_id);

drop policy if exists "recent_select_own" on public.user_recent_coins;
create policy "recent_select_own" on public.user_recent_coins for select using (auth.uid() = user_id);
drop policy if exists "recent_insert_own" on public.user_recent_coins;
create policy "recent_insert_own" on public.user_recent_coins for insert with check (auth.uid() = user_id);
drop policy if exists "recent_update_own" on public.user_recent_coins;
create policy "recent_update_own" on public.user_recent_coins for update using (auth.uid() = user_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_app_profile on auth.users;
create trigger on_auth_user_created_app_profile
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();
