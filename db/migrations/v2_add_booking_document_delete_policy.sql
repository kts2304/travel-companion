drop policy if exists "booking_documents_public_delete" on storage.objects;
create policy "booking_documents_public_delete"
on storage.objects
for delete
to public
using (bucket_id = 'booking-documents');
