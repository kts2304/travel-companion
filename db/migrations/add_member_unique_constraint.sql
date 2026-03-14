create unique index if not exists members_trip_id_name_unique
on members (trip_id, lower(trim(name)));
