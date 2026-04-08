-- Officiant self-service applications (pre-approval queue)
-- Run in Supabase SQL editor or via supabase db push

create table if not exists public.officiant_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  business_name text not null default '',
  specialty text not null default '',
  bio text not null default '',
  location text not null default '',
  travel_radius text not null default '',
  photo_url text not null default '',
  years_experience integer,
  ceremony_tags text[] not null default '{}',
  beliefs_style text[] not null default '{}',
  price_micro integer not null,
  price_intimate integer not null,
  price_full integer not null,
  price_grand integer not null,
  email text not null,
  status text not null default 'pending',
  is_active boolean not null default false,
  constraint officiant_applications_status_check check (status in ('pending', 'approved', 'rejected'))
);

comment on table public.officiant_applications is 'Officiant signup submissions; reviewed before listing.';

create index if not exists officiant_applications_created_at_idx on public.officiant_applications (created_at desc);
create index if not exists officiant_applications_status_idx on public.officiant_applications (status);

alter table public.officiant_applications enable row level security;

-- Anonymous (mobile app) insert only — no public reads
create policy "Allow anon insert officiant_applications"
  on public.officiant_applications
  for insert
  to anon
  with check (true);

create policy "Allow authenticated insert officiant_applications"
  on public.officiant_applications
  for insert
  to authenticated
  with check (true);
