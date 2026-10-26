# Aone Kirana — Supabase Backend Setup Guide

This guide walks you through connecting your **Aone Kirana** grocery platform to a live **Supabase** backend with Authentication, PostgreSQL Database, and Realtime sync.

---

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Set:
   - **Name**: `Aone Kirana`
   - **Database Password**: (choose a strong password and save it)
   - **Region**: Choose `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)` for the fastest response times in Nepal.
4. Click **Create new project**.

---

### Step 2: Run the SQL Schema & Seed Data
1. In your Supabase Dashboard, open the **SQL Editor** tab on the left sidebar.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](file:///c:/Users/saroj/Desktop/Aone%20kirana/supabase/schema.sql) in this repository and copy its entire contents.
4. Paste the SQL into the Supabase SQL Editor and click **Run** (or `Ctrl + Enter`).

> This automatically creates:
> - `profiles` table (linked to auth users with full name, phone number, address, role).
> - `products` table (pre-populated with 10+ fresh grocery items with prices in Rs.).
> - `orders` table (live order tracking and status management).
> - `order_items` table (products ordered per cart).
> - Row Level Security (RLS) policies.
> - Realtime replication channels for instant updates.

---

### Step 3: Add API Keys to `.env`
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Find:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API keys** -> `anon` / `public`
3. Open the file [`.env`](file:///c:/Users/saroj/Desktop/Aone%20kirana/.env) in the root of your project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
4. Save the file. Vite will automatically reload!

---

### Step 4: Verification & Live Testing
1. Open [http://localhost:5173/](http://localhost:5173/).
2. Go to **Account** tab:
   - Notice the status badge switches to **Connected to Live Supabase DB**.
   - Click **Login / Join** to create a customer account.
3. Add items to your Cart and click **Checkout**.
4. Click **Confirm Order**:
   - The order is inserted directly into the Supabase `orders` and `order_items` tables!
5. Open **Store Manager Portal** (Admin):
   - You can see orders arrive live in real time.
   - Update grocery prices or stock availability, and the storefront updates immediately without refreshing.
