# Travel Companion V1 Architecture

## Overview
Travel Companion is a Next.js App Router application with Supabase PostgreSQL as the backend datastore.

## Layers
- UI Layer (`app/*`, `components/forms/*`)
- Service Layer (`services/*`)
- Data Layer (Supabase tables defined in `db/migrations/init_schema.sql`)
- Domain Utilities (`lib/calculations/*`)

## Request/Data Flow
1. User submits a form in a client component built with `react-hook-form` and `zod`.
2. Form calls a service function from `services/*`.
3. Service executes all Supabase queries through `lib/supabaseClient.ts`.
4. Pages fetch trip/member/expense data via service functions.
5. Balance and settlement outputs are computed in `lib/calculations/splitExpense.ts`.

## V1 Scope
- Create trip
- Add members
- Add expenses
- Equal split logic
- Display overall balances and settlements
- Display day-wise balances and settlements based on `expense_date`
