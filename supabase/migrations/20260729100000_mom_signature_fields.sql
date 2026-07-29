-- MOM PDF signature block fields (excluding handwritten signature)
alter table public.mom_report
  add column if not exists customer_remarks text;

alter table public.mom_report
  add column if not exists signer_name text;

alter table public.mom_report
  add column if not exists signer_designation text;

alter table public.mom_report
  add column if not exists signer_date date;

comment on column public.mom_report.customer_remarks is
  'Customer Remarks line shown above the MOM PDF signature footer';
comment on column public.mom_report.signer_name is
  'Integrate Techno Trade signer name on the MOM PDF footer';
comment on column public.mom_report.signer_designation is
  'Integrate Techno Trade signer designation on the MOM PDF footer';
comment on column public.mom_report.signer_date is
  'Date shown in the Integrate Techno Trade column of the MOM PDF footer';
