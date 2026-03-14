# Travel Companion Architecture

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

## V2.1 Personal Travel Layer
- `bookings` now supports `scope` (`shared` or `personal`) and optional `member_id`
- Shared bookings cover trip-wide plans such as hotels, activities, and shared transport
- Personal bookings cover traveler-specific tickets such as flights and bus travel
- The Bookings tab renders both:
  - a shared trip timeline for group items
  - a `My Travel` panel that resolves the signed-in Supabase user against `members.email`
- Booking documents remain attached to the booking, so personal flight or bus files stay scoped to that traveler view

## V2.2 App Auth
- App-side auth is handled through a dedicated auth service in `services/authService.ts`
- The homepage includes sign-in and sign-up flows for email/password and GitHub OAuth
- The GitHub OAuth callback returns to `app/auth/callback/page.tsx`
- Trip pages surface the active session so the current signed-in email is visible while testing personal travel flows
