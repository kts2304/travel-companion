create table if not exists booking_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  file_url text not null,
  created_at timestamp not null default now()
);

insert into storage.buckets (id, name, public)
values ('booking-documents', 'booking-documents', true)
on conflict (id) do nothing;

drop policy if exists "booking_documents_public_read" on storage.objects;
create policy "booking_documents_public_read"
on storage.objects
for select
to public
using (bucket_id = 'booking-documents');

drop policy if exists "booking_documents_public_insert" on storage.objects;
create policy "booking_documents_public_insert"
on storage.objects
for insert
to public
with check (bucket_id = 'booking-documents');
