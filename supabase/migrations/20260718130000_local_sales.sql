-- Local Sales module
-- Same ownership model as sales_commission: admins own their rows; super_admin manages all.

create table if not exists public.local_sales (
  id uuid primary key default gen_random_uuid(),
  delivery_date date,
  manufacturer_name text,
  customer_name text,
  purchase_amount numeric(14, 2),
  sales_amount numeric(14, 2),
  commission_amount numeric(14, 2),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists local_sales_created_by_idx
  on public.local_sales (created_by);

create index if not exists local_sales_delivery_date_idx
  on public.local_sales (delivery_date);

drop trigger if exists set_updated_at on public.local_sales;
create trigger set_updated_at
  before update on public.local_sales
  for each row
  execute function public.set_updated_at();

alter table public.local_sales enable row level security;

drop policy if exists "local_sales_select" on public.local_sales;
create policy "local_sales_select"
  on public.local_sales for select
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  );

drop policy if exists "local_sales_insert" on public.local_sales;
create policy "local_sales_insert"
  on public.local_sales for insert
  to authenticated
  with check (
    public.current_user_role() in ('super_admin', 'admin')
    and created_by = auth.uid()
  );

drop policy if exists "local_sales_update" on public.local_sales;
create policy "local_sales_update"
  on public.local_sales for update
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

drop policy if exists "local_sales_delete" on public.local_sales;
create policy "local_sales_delete"
  on public.local_sales for delete
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and created_by = auth.uid()
    )
  );
