begin;

-- =========================================================
-- Function for automatically updating updated_at
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- Materials
-- =========================================================

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  name text not null,
  category text,
  unit text not null default 'piece',
  unit_cost numeric(12, 4) not null default 0
    check (unit_cost >= 0),
  supplier text,
  notes text,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- Customers
-- =========================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  name text not null,
  email text,
  phone text,
  address text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- Cost calculations
-- =========================================================

create table public.cost_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  name text not null,
  description text,
  currency text not null default 'GBP'
    check (char_length(currency) = 3),

  labour_hours numeric(10, 2) not null default 0
    check (labour_hours >= 0),
  hourly_rate numeric(12, 2) not null default 0
    check (hourly_rate >= 0),
  labour_cost numeric(12, 2) not null default 0
    check (labour_cost >= 0),

  material_cost numeric(12, 2) not null default 0
    check (material_cost >= 0),
  packaging_cost numeric(12, 2) not null default 0
    check (packaging_cost >= 0),
  delivery_cost numeric(12, 2) not null default 0
    check (delivery_cost >= 0),
  other_cost numeric(12, 2) not null default 0
    check (other_cost >= 0),

  platform_fee_percentage numeric(6, 2) not null default 0
    check (platform_fee_percentage >= 0),
  platform_fee_amount numeric(12, 2) not null default 0
    check (platform_fee_amount >= 0),

  total_cost numeric(12, 2) not null default 0
    check (total_cost >= 0),
  profit_percentage numeric(6, 2) not null default 0
    check (profit_percentage >= 0),
  estimated_profit numeric(12, 2) not null default 0,
  recommended_price numeric(12, 2) not null default 0
    check (recommended_price >= 0),

  status text not null default 'draft'
    check (status in ('draft', 'completed')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- Materials used in each calculation
-- =========================================================

create table public.calculation_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  calculation_id uuid not null
    references public.cost_calculations(id) on delete cascade,
  material_id uuid
    references public.materials(id) on delete set null,

  material_name text not null,
  quantity numeric(12, 4) not null
    check (quantity > 0),
  unit text not null,
  unit_cost numeric(12, 4) not null
    check (unit_cost >= 0),
  total_cost numeric(12, 2) not null
    check (total_cost >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- Quotations
-- =========================================================

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  quotation_number text not null,
  customer_id uuid
    references public.customers(id) on delete set null,
  calculation_id uuid
    references public.cost_calculations(id) on delete set null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'sent',
        'accepted',
        'rejected',
        'expired'
      )
    ),

  issue_date date not null default current_date,
  expiry_date date,
  jewellery_description text not null,
  quantity integer not null default 1
    check (quantity > 0),

  currency text not null default 'GBP'
    check (char_length(currency) = 3),
  subtotal numeric(12, 2) not null default 0
    check (subtotal >= 0),
  delivery_cost numeric(12, 2) not null default 0
    check (delivery_cost >= 0),
  total numeric(12, 2) not null default 0
    check (total >= 0),
  deposit_required numeric(12, 2) not null default 0
    check (deposit_required >= 0),

  estimated_production_time text,
  payment_terms text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint quotations_expiry_date_check
    check (expiry_date is null or expiry_date >= issue_date),

  constraint quotations_user_number_unique
    unique (user_id, quotation_number)
);


-- =========================================================
-- Triggers for updated_at
-- =========================================================

create trigger set_materials_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger set_cost_calculations_updated_at
before update on public.cost_calculations
for each row execute function public.set_updated_at();

create trigger set_calculation_materials_updated_at
before update on public.calculation_materials
for each row execute function public.set_updated_at();

create trigger set_quotations_updated_at
before update on public.quotations
for each row execute function public.set_updated_at();


-- =========================================================
-- Indexes
-- =========================================================

create index materials_user_id_idx
on public.materials(user_id);

create index customers_user_id_idx
on public.customers(user_id);

create index cost_calculations_user_id_idx
on public.cost_calculations(user_id);

create index calculation_materials_user_id_idx
on public.calculation_materials(user_id);

create index calculation_materials_calculation_id_idx
on public.calculation_materials(calculation_id);

create index quotations_user_id_idx
on public.quotations(user_id);

create index quotations_customer_id_idx
on public.quotations(customer_id);

create index quotations_calculation_id_idx
on public.quotations(calculation_id);


-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.materials enable row level security;
alter table public.customers enable row level security;
alter table public.cost_calculations enable row level security;
alter table public.calculation_materials enable row level security;
alter table public.quotations enable row level security;


-- =========================================================
-- Security policies
-- Each authenticated user can only access their own records
-- =========================================================

create policy "Users can manage their own materials"
on public.materials
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own customers"
on public.customers
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own cost calculations"
on public.cost_calculations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own calculation materials"
on public.calculation_materials
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own quotations"
on public.quotations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);


-- =========================================================
-- Permissions
-- =========================================================

revoke all on table
  public.materials,
  public.customers,
  public.cost_calculations,
  public.calculation_materials,
  public.quotations
from anon;

grant select, insert, update, delete on table
  public.materials,
  public.customers,
  public.cost_calculations,
  public.calculation_materials,
  public.quotations
to authenticated;

commit;