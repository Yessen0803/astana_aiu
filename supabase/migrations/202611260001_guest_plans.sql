-- Allow users to save activity and meal plans before creating a permanent account.
-- A Supabase anonymous Auth session still has a private auth.uid(), so RLS can
-- keep each guest's data isolated until they later add an email/password.

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner')),
  recipe_id text not null check (char_length(recipe_id) between 1 and 120),
  servings integer not null default 1 check (servings between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date, meal_slot)
);

drop trigger if exists meal_plans_updated_at on public.meal_plans;
create trigger meal_plans_updated_at before update on public.meal_plans
for each row execute procedure public.set_healthflow_updated_at();

create index if not exists meal_plans_user_date_idx
  on public.meal_plans (user_id, plan_date desc);

revoke all on public.meal_plans from anon, authenticated;
grant select, insert, update, delete on public.meal_plans to authenticated;
alter table public.meal_plans enable row level security;

drop policy if exists "Users manage their own meal plans" on public.meal_plans;
create policy "Users manage their own meal plans" on public.meal_plans for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
