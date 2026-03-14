create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  type text not null check (type in ('flight', 'hotel', 'transport', 'activity')),
  title text not null,
  start_date timestamp not null,
  end_date timestamp,
  notes text,
  created_at timestamp not null default now()
);
