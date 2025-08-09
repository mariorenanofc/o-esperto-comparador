-- Create table to log comparison exports
create table if not exists public.comparison_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  comparison_id uuid null,
  format text not null default 'pdf',
  plan text null,
  file_size_bytes integer null,
  meta jsonb null,
  exported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.comparison_exports enable row level security;

-- Policies
create policy "Users can insert their own exports"
  on public.comparison_exports
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own exports"
  on public.comparison_exports
  for select
  using (auth.uid() = user_id);

create policy "Admins can view all exports"
  on public.comparison_exports
  for select
  using (is_user_admin());

-- Helpful indexes
create index if not exists idx_comparison_exports_user_id on public.comparison_exports(user_id);
create index if not exists idx_comparison_exports_exported_at on public.comparison_exports(exported_at);
