-- Safe, minimal staff directory used only to assign cleared consultations.

create or replace function public.list_active_lawyers_for_scheduling(p_firm_id uuid)
returns table (
  user_id uuid,
  display_name text,
  role public.membership_role
)
language sql
stable
security definer
set search_path = public
as $$
  select
    fm.user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Office lawyer') as display_name,
    fm.role
  from public.firm_memberships fm
  left join public.profiles p on p.id = fm.user_id
  where fm.firm_id = p_firm_id
    and fm.status = 'active'
    and fm.role in ('firm_admin', 'managing_partner', 'partner', 'associate')
    and public.has_firm_role(
      p_firm_id,
      array['firm_admin', 'managing_partner', 'partner', 'associate', 'paralegal', 'legal_secretary']::public.membership_role[]
    )
  order by
    case fm.role
      when 'managing_partner' then 1
      when 'firm_admin' then 2
      when 'partner' then 3
      else 4
    end,
    display_name;
$$;

revoke all on function public.list_active_lawyers_for_scheduling(uuid) from public;
grant execute on function public.list_active_lawyers_for_scheduling(uuid) to authenticated;
