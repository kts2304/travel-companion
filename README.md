# Travel Companion

A unified travel management web application.

The goal of this project is to provide travelers with a single place to manage group trips, expenses, and trip-related information.

---

## Tech Stack

Frontend

* Next.js (App Router)
* TypeScript

Backend

* Supabase (PostgreSQL)

Libraries

* @supabase/supabase-js
* react-hook-form
* zod

---

## Version 1 – Expense Management (Completed)

V1 focuses on group expense management for trips.

Features:

* Create trips
* Add members to trips
* Add shared expenses
* Automatically split expenses equally
* Display balances between members

Example:

Rahul owes Teju ₹500

Architecture:

UI → Service Layer → Supabase Database

All database access happens through the service layer.

---

## Version 2 – Trip Container (In Progress)

V2 expands the system into a **trip organizer**.

Trips will support storing booking information.

New Features:

* Trip dashboard with tab layout
* Members tab
* Expenses tab
* Bookings tab
* Add booking records (flight, hotel, transport, activity)
* Display bookings sorted by date (trip timeline)

Example:

Trip Dashboard

Members | Expenses | Bookings

---

## Database Overview

Tables used in V1:

* trips
* members
* expenses
* expense_splits

New table added in V2:

* bookings

Relationships:

Trip → Members
Trip → Expenses
Trip → Bookings
Expense → Expense Splits

---

## Project Structure

travel-companion/

app/ – Next.js pages
components/ – UI components
services/ – database queries
lib/ – shared utilities
types/ – TypeScript types
db/migrations – SQL migrations
tests/ – business logic tests
docs/ – architecture documentation

---

## Development Workflow

Main branch contains stable releases.

Development for new features happens in separate branches.

Example:

main → stable V1
v2-trip-container → development for V2 features

---

## Future Roadmap

V3 – Offline Essentials

Planned features:

* offline datasets for emergency locations
* hospital / police / pharmacy search
* offline trip utilities

---

## Running the Project

Install dependencies:

npm install

Start development server:

npm run dev

Then open:

http://localhost:3000

## App Authentication

Travel Companion now supports app-side authentication using Supabase Auth.

Supported sign-in methods in the UI:

* Email + password
* GitHub OAuth

For GitHub sign-in, enable the GitHub provider in Supabase Auth and add this callback URL:

`http://localhost:3000/auth/callback`
