create extension if not exists pgcrypto;

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  email text,
  auth_user_id uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists members_trip_id_name_unique
on members (trip_id, lower(trim(name)));

create unique index if not exists members_trip_id_auth_user_unique
on members (trip_id, auth_user_id)
where auth_user_id is not null;

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  paid_by_member_id uuid not null references members(id) on delete restrict,
  description text not null,
  total_amount numeric(10, 2) not null check (total_amount > 0),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  owed_amount numeric(10, 2) not null check (owed_amount > 0),
  created_at timestamptz not null default now(),
  unique (expense_id, member_id)
);

create or replace function validate_expense_split_member()
returns trigger as $$
begin
  if exists (
    select 1
    from expenses e
    where e.id = new.expense_id
      and e.paid_by_member_id = new.member_id
  ) then
    raise exception 'Payer cannot be part of expense_splits for the same expense';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_validate_expense_split_member on expense_splits;
create trigger trg_validate_expense_split_member
before insert or update on expense_splits
for each row
execute function validate_expense_split_member();
