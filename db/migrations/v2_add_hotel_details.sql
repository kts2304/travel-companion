alter table bookings
add column if not exists hotel_name text,
add column if not exists room_number text,
add column if not exists place text;
