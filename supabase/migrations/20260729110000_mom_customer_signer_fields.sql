-- Customer column fields for the MOM PDF signature footer
alter table public.mom_report
  add column if not exists customer_signer_name text;

alter table public.mom_report
  add column if not exists customer_signer_designation text;

alter table public.mom_report
  add column if not exists customer_signer_date date;

comment on column public.mom_report.customer_signer_name is
  'Customer signer name on the MOM PDF footer';
comment on column public.mom_report.customer_signer_designation is
  'Customer signer designation on the MOM PDF footer';
comment on column public.mom_report.customer_signer_date is
  'Date shown in the Customer column of the MOM PDF footer';
