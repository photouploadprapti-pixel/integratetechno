-- Cash Book expense categories + restricted access
-- Accessible only to super_admin and service2@integratebd.com

alter table public.cash_book
  add column if not exists expense_category text;

create index if not exists cash_book_expense_category_idx
  on public.cash_book (expense_category);

-- Replace open staff policy with restricted access
drop policy if exists "cash_book_staff_all" on public.cash_book;
drop policy if exists "cash_book_restricted" on public.cash_book;

create policy "cash_book_restricted"
  on public.cash_book for all
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and exists (
        select 1
        from public.users u
        where u.id = auth.uid()
          and lower(u.email) = 'service2@integratebd.com'
      )
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and exists (
        select 1
        from public.users u
        where u.id = auth.uid()
          and lower(u.email) = 'service2@integratebd.com'
      )
    )
  );
