-- Use this to start fresh while keeping schema.
-- Clears V1 + V2 relational data and uploaded booking documents.

delete from storage.objects
where bucket_id = 'booking-documents';

truncate table booking_documents, bookings, expense_splits, expenses, members, trips
restart identity cascade;
