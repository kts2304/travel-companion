alter table bookings
add column if not exists scope text not null default 'shared';

alter table bookings
add column if not exists member_id uuid references members(id) on delete cascade;

update bookings
set scope = case
  when type in ('flight', 'bus') then 'personal'
  else 'shared'
end
where scope is null or scope = 'shared';

alter table bookings
drop constraint if exists bookings_scope_check;

alter table bookings
add constraint bookings_scope_check
check (scope in ('shared', 'personal'));

create or replace function validate_booking_member_trip()
returns trigger
language plpgsql
as $$
declare
  booking_trip_id uuid;
  member_trip_id uuid;
begin
  if new.member_id is null then
    return new;
  end if;

  select trip_id into booking_trip_id
  from bookings
  where id = new.id;

  if tg_op in ('INSERT', 'UPDATE') then
    booking_trip_id := new.trip_id;
  end if;

  select trip_id into member_trip_id
  from members
  where id = new.member_id;

  if member_trip_id is distinct from booking_trip_id then
    raise exception 'Selected traveler does not belong to this trip';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_booking_member_trip on bookings;

create trigger trg_validate_booking_member_trip
before insert or update on bookings
for each row
execute function validate_booking_member_trip();
