alter table bookings
add column if not exists onward_origin text,
add column if not exists onward_destination text,
add column if not exists onward_flight_number text,
add column if not exists onward_departure_at timestamptz,
add column if not exists onward_seat_number text,
add column if not exists onward_pnr text,
add column if not exists return_origin text,
add column if not exists return_destination text,
add column if not exists return_flight_number text,
add column if not exists return_departure_at timestamptz,
add column if not exists return_seat_number text,
add column if not exists return_pnr text;

alter table booking_documents
add column if not exists document_kind text not null default 'booking';

alter table booking_documents
drop constraint if exists booking_documents_document_kind_check;

alter table booking_documents
add constraint booking_documents_document_kind_check
check (document_kind in ('booking', 'checkin'));
