# Database Design (V1)

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
- One `expense` has many `expense_splits`

## Constraints
- UUID primary keys on every table
- Positive amount checks for `expenses.total_amount` and `expense_splits.owed_amount`
- Cascading deletes applied where child records should be removed automatically
- Day-wise granularity is enabled through `expenses.expense_date`

## Demo Seeds
- To reset data only: run `db/migrations/reset_all_data.sql`
- To load basic sample: run `db/seed/seed_data.sql`
- To demo multiple creditors in settlements: run `db/seed/seed_multi_creditor.sql`
