# Travel Companion V1 Architecture

## Overview
Travel Companion is a Next.js App Router application with Supabase PostgreSQL as the backend datastore.

## Layers
- UI Layer (`app/*`, `components/forms/*`)
- Trip Container Layer (`components/trip/*`)
- Service Layer (`services/*`)
- Data Layer (Supabase tables defined in `db/migrations/init_schema.sql`)
- Domain Utilities (`lib/calculations/*`)

## Request/Data Flow
1. User submits a form in a client component built with `react-hook-form` and `zod`.
2. Form calls a service function from `services/*`.
3. Service executes all Supabase queries through `lib/supabaseClient.ts`.
4. Pages fetch trip/member/expense data via service functions.
5. Balance and settlement outputs are computed in `lib/calculations/splitExpense.ts`.
6. The trip page acts as a container and delegates section rendering to `TripTabs`.

## V1 Scope
- Create trip
- Add members
- Add expenses
- Equal split logic
- Display overall balances and settlements
- Display day-wise balances and settlements based on `expense_date`

## V2 Trip Container
- `app/trips/[tripId]/page.tsx` is the main dashboard for a trip
- `TripTabs` controls the active section: Members, Expenses, Bookings
- Bookings are managed through a dedicated service and shown as a date-sorted timeline
- The modular tab structure keeps each section isolated while preserving a single trip dashboard experience
