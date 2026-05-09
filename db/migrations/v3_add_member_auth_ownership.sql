alter table members
add column if not exists auth_user_id uuid;

create unique index if not exists members_trip_id_auth_user_unique
on members (trip_id, auth_user_id)
where auth_user_id is not null;
