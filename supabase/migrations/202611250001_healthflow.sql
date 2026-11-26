-- HealthFlow starter schema for Supabase (Postgres + Auth + Row Level Security).
-- Run this file once in Supabase Dashboard -> SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'HealthFlow user' check (char_length(display_name) between 1 and 60),
  city text not null default '',
  bio text not null default '' check (char_length(bio) <= 180),
  instagram text not null default '',
  tiktok text not null default '',
  avatar_path text,
  is_public boolean not null default false,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_healthflow_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_healthflow_admin() from public, anon;
grant execute on function public.is_healthflow_admin() to authenticated;

create or replace function public.handle_new_healthflow_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, city)
  values (
    new.id,
    coalesce(nullif(left(new.raw_user_meta_data ->> 'display_name', 60), ''), 'HealthFlow user'),
    coalesce(left(new.raw_user_meta_data ->> 'city', 60), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_healthflow on auth.users;
create trigger on_auth_user_created_healthflow
  after insert on auth.users
  for each row execute procedure public.handle_new_healthflow_user();

create or replace function public.set_healthflow_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute procedure public.set_healthflow_updated_at();

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  steps integer not null default 0 check (steps between 0 and 100000),
  water_ml integer not null default 0 check (water_ml between 0 and 20000),
  sleep_start text not null default '22:30',
  sleep_end text not null default '07:00',
  mood text not null default '',
  completed_habits jsonb not null default '[]'::jsonb,
  planned_activities text[] not null default '{}',
  completed_activities text[] not null default '{}',
  care_done text[] not null default '{}',
  note text not null default '' check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

drop trigger if exists daily_logs_updated_at on public.daily_logs;
create trigger daily_logs_updated_at before update on public.daily_logs
for each row execute procedure public.set_healthflow_updated_at();

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  activity_name text not null check (char_length(activity_name) between 1 and 120),
  duration_minutes integer not null default 0 check (duration_minutes between 0 and 1440),
  created_at timestamptz not null default now()
);

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name text not null check (char_length(meal_name) between 1 and 160),
  portion_grams integer check (portion_grams between 1 and 5000),
  calories integer check (calories between 0 and 10000),
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  place_name text not null,
  reservation_date date not null,
  reservation_time time not null,
  guest_count integer not null default 1 check (guest_count between 1 and 20),
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at before update on public.reservations
for each row execute procedure public.set_healthflow_updated_at();

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  caption text not null default '' check (char_length(caption) <= 2000),
  image_path text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists community_posts_updated_at on public.community_posts;
create trigger community_posts_updated_at before update on public.community_posts
for each row execute procedure public.set_healthflow_updated_at();

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'misinformation', 'inappropriate', 'other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null default '' check (char_length(body) <= 1000),
  icon text not null default 'notifications',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'admin')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.friend_connections (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date desc);
create index if not exists activity_logs_user_date_idx on public.activity_logs (user_id, activity_date desc);
create index if not exists meal_entries_user_date_idx on public.meal_entries (user_id, meal_date desc);
create index if not exists reservations_user_date_idx on public.reservations (user_id, reservation_date desc);
create index if not exists community_posts_created_idx on public.community_posts (created_at desc) where is_hidden = false;
create index if not exists post_comments_post_created_idx on public.post_comments (post_id, created_at);
create index if not exists post_reports_status_created_idx on public.post_reports (status, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists support_messages_user_created_idx on public.support_messages (user_id, created_at);

-- Remove default broad grants before adding the least privileges required by the app.
revoke all on public.profiles, public.daily_logs, public.activity_logs, public.meal_entries,
  public.reservations, public.community_posts, public.post_comments, public.post_likes,
  public.post_reports, public.notifications, public.support_messages, public.friend_connections
from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name, city, bio, instagram, tiktok, avatar_path, is_public) on public.profiles to authenticated;
grant update (display_name, city, bio, instagram, tiktok, avatar_path, is_public) on public.profiles to authenticated;
grant update (role) on public.profiles to authenticated;
grant select, insert, update, delete on public.daily_logs, public.activity_logs, public.meal_entries,
  public.community_posts, public.post_comments, public.post_likes,
  public.post_reports, public.support_messages to authenticated;
grant select, insert, delete on public.reservations to authenticated;
grant update (status) on public.reservations to authenticated;
grant select, insert, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, delete on public.friend_connections to authenticated;
grant update (status) on public.friend_connections to authenticated;

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.meal_entries enable row level security;
alter table public.reservations enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.support_messages enable row level security;
alter table public.friend_connections enable row level security;

create policy "Profiles are public or owned" on public.profiles for select to authenticated
  using (is_public or id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Users create own profile" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and role = 'user');
create policy "Users update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Admins update profiles" on public.profiles for update to authenticated
  using ((select public.is_healthflow_admin())) with check ((select public.is_healthflow_admin()));

create policy "Users manage own daily logs" on public.daily_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users manage own activities" on public.activity_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users manage own meals" on public.meal_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users read own reservations and admins read all" on public.reservations for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Users create own reservations" on public.reservations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users cancel own pending reservations" on public.reservations for update to authenticated
  using (user_id = (select auth.uid()) and status = 'pending') with check (user_id = (select auth.uid()) and status = 'cancelled');
create policy "Admins manage reservations" on public.reservations for update to authenticated
  using ((select public.is_healthflow_admin())) with check ((select public.is_healthflow_admin()));
create policy "Users delete own reservations" on public.reservations for delete to authenticated
  using (user_id = (select auth.uid()) and status = 'pending');

create policy "Signed-in users read visible posts" on public.community_posts for select to authenticated
  using (not is_hidden or author_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Users create own posts" on public.community_posts for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "Authors and admins update posts" on public.community_posts for update to authenticated
  using (author_id = (select auth.uid()) or (select public.is_healthflow_admin()))
  with check (author_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Authors and admins delete posts" on public.community_posts for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_healthflow_admin()));

create policy "Signed-in users read comments on visible posts" on public.post_comments for select to authenticated
  using (
    author_id = (select auth.uid())
    or (select public.is_healthflow_admin())
    or exists (
      select 1 from public.community_posts p
      where p.id = post_id and not p.is_hidden
    )
  );
create policy "Users create their own comments" on public.post_comments for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.community_posts p where p.id = post_id and not p.is_hidden)
  );
create policy "Authors and admins delete comments" on public.post_comments for delete to authenticated
  using (author_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Signed-in users read likes" on public.post_likes for select to authenticated using (true);
create policy "Users manage their own likes" on public.post_likes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users submit and view own reports" on public.post_reports for select to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Users submit reports for themselves" on public.post_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "Admins resolve reports" on public.post_reports for update to authenticated
  using ((select public.is_healthflow_admin())) with check ((select public.is_healthflow_admin()));
create policy "Admins remove invalid reports" on public.post_reports for delete to authenticated
  using ((select public.is_healthflow_admin()));

create policy "Users read their notifications" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users mark their notifications read" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Admins send notifications" on public.notifications for insert to authenticated
  with check ((select public.is_healthflow_admin()));

create policy "Users and admins read support messages" on public.support_messages for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_healthflow_admin()));
create policy "Users send own support messages" on public.support_messages for insert to authenticated
  with check (user_id = (select auth.uid()) and sender_role = 'user');
create policy "Admins reply to support messages" on public.support_messages for insert to authenticated
  with check ((select public.is_healthflow_admin()) and sender_role = 'admin');

create policy "Users read their friend connections" on public.friend_connections for select to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
create policy "Users send friend requests" on public.friend_connections for insert to authenticated
  with check (requester_id = (select auth.uid()));
create policy "Users accept or block incoming requests" on public.friend_connections for update to authenticated
  using (addressee_id = (select auth.uid())) with check (addressee_id = (select auth.uid()));
create policy "Requesters remove their requests" on public.friend_connections for delete to authenticated
  using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
