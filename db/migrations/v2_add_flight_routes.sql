alter table bookings
add column if not exists onward_origin text,
add column if not exists onward_destination text,
add column if not exists return_origin text,
add column if not exists return_destination text;
