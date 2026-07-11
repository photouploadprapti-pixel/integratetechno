-- Allow multiple Report Types on S/I/S reports (Service, Installation, Sales Report).

alter table public.s_i_s_report
  alter column service_type type public.service_type[]
  using case
    when service_type is null then '{}'::public.service_type[]
    else array[service_type]::public.service_type[]
  end;

alter table public.s_i_s_report
  alter column service_type set default '{}'::public.service_type[];

comment on column public.s_i_s_report.service_type is
  'Multi-select Report Type: Service, Installation, Sales Report';
