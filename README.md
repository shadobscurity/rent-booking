# Rent Booking MVP (Browser-only Setup)

Stack: **Next.js 14 (App Router) + Supabase (DB) + Tailwind**.  
No local dev required: deploy with **Vercel**, create DB in **Supabase**.

## 1) Create accounts
- Vercel (free)
- Supabase (free)

## 2) Create a new Supabase project
- Copy your **Project URL**, **anon key**, and **service_role key** (Settings → API).
- Open **SQL Editor** and run `supabase/schema.sql` and then `supabase/seed.sql`.

## 3) Deploy to Vercel
- Import this repo to GitHub, or upload it on Vercel directly.
- Set Environment Variables in Vercel:
  - `NEXT_PUBLIC_SITE_URL` (your Vercel URL, e.g. https://your-app.vercel.app)
  - `SUPABASE_URL` (Project URL)
  - `SUPABASE_ANON_KEY` (anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (service_role, server-only)

## 4) Test
- Open the site, pick a product, choose date, submit booking.
- Admin can view data in Supabase Tables.

## Payments
- This MVP saves orders as **PENDING**. Add Midtrans/Xendit later via `/api/checkout` and a webhook.
