-- Sales Commission module
-- Admins own their rows; super_admin can manage all rows.

create table if not exists public.sales_commission (
  id uuid primary key default gen_random_uuid(),
  lc_number text,
  shipment_date date,
  expiry_date date,
  manufacturer_name text,
  customer_name text,
  lc_amount numeric(14, 2),
  commission_amount numeric(14, 2),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists sales_commission_created_by_idx
  on public.sales_commission (created_by);

create index if not exists sales_commission_lc_number_idx
  on public.sales_commission (lc_number);

create index if not exists sales_commission_shipment_date_idx
  on public.sales_commission (shipment_date);

drop trigger if exists set_updated_at on public.sales_commission;
create trigger set_updated_at
  before update on public.sales_commission
  for each row
  execute function public.set_updated_at();

alter table public.sales_commission enable row level security;

-- SELECT: super_admin sees all; admin sees only own rows
drop policy if exists "sales_commission_select" on public.sales_commission;
create policy "sales_commission_select"
  on public.sales_commission for select
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  );

-- INSERT: admin / super_admin may insert only as themselves
drop policy if exists "sales_commission_insert" on public.sales_commission;
create policy "sales_commission_insert"
  on public.sales_commission for insert
  to authenticated
  with check (
    public.current_user_role() in ('super_admin', 'admin')
    and created_by = auth.uid()
  );

-- UPDATE: super_admin any row; admin only own rows (cannot reassign owner)
drop policy if exists "sales_commission_update" on public.sales_commission;
create policy "sales_commission_update"
  on public.sales_commission for update
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  );

-- DELETE: super_admin any row; admin only own rows
drop policy if exists "sales_commission_delete" on public.sales_commission;
create policy "sales_commission_delete"
  on public.sales_commission for delete
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  );
