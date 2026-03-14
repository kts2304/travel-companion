# Database Design

Schema file: `db/migrations/init_schema.sql`  
Seed files:
- `db/seed/seed_data.sql` (basic sample)
- `db/seed/seed_multi_creditor.sql` (demo with multiple net creditors)

## Tables
- `trips`
  - `id` UUID PK
  - `name`, `destination`, `start_date`, `end_date`
  - `created_at`
- `members`
  - `id` UUID PK
  - `trip_id` FK -> `trips.id` (`on delete cascade`)
  - `name`, `email`
  - `created_at`
- `expenses`
  - `id` UUID PK
  - `trip_id` FK -> `trips.id` (`on delete cascade`)
  - `paid_by_member_id` FK -> `members.id`
  - `description`, `total_amount`, `expense_date`
  - `created_at`
- `bookings`
  - `id` UUID PK
  - `trip_id` FK -> `trips.id` (`on delete cascade`)
  - `type`, `scope`, `member_id`, `title`, `start_date`, `end_date`, `notes`
  - `created_at`
- `booking_documents`
  - `id` UUID PK
  - `booking_id` FK -> `bookings.id` (`on delete cascade`)
  - `file_url`
  - `created_at`
- `expense_splits`
  - `id` UUID PK
  - `expense_id` FK -> `expenses.id` (`on delete cascade`)
  - `member_id` FK -> `members.id` (`on delete cascade`)
  - `owed_amount`
  - `created_at`
  - unique constraint: (`expense_id`, `member_id`)

## Relationships
- One `trip` has many `members`
- One `trip` has many `expenses`
- One `trip` has many `bookings`
- One `member` can have many personal `bookings`
- One `expense` has many `expense_splits`
- One `booking` has many `booking_documents`

## Constraints
- UUID primary keys on every table
- Positive amount checks for `expenses.total_amount` and `expense_splits.owed_amount`
- Cascading deletes applied where child records should be removed automatically
- Day-wise granularity is enabled through `expenses.expense_date`
- V2 trip container data is extended through `bookings` for itinerary timeline support
- `bookings.scope` separates group items from traveler-specific tickets
- `bookings.member_id` links personal bookings to a trip member
- `v2_personalize_bookings.sql` adds cross-trip validation so a personal booking can only point to a member from the same trip

## Demo Seeds
- To reset data only: run `db/migrations/reset_all_data.sql`
- To load basic sample: run `db/seed/seed_data.sql`
- To demo multiple creditors in settlements: run `db/seed/seed_multi_creditor.sql`

## Booking Migrations
- `db/migrations/v2_add_bookings.sql`
- `db/migrations/v2_add_booking_documents.sql`
- `db/migrations/v2_personalize_bookings.sql`
