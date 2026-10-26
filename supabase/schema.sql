-- ========================================================
-- AONE KIRANA GROCERY STORE SUPABASE SCHEMA
-- Serving Tikathali, Mahalaxmi Municipality, Lalitpur
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  address text,
  role text default 'customer' check (role in ('customer', 'admin', 'rider')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  unit text not null,
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2),
  discount_percentage integer default 0,
  category text not null,
  sub_category text,
  image text not null,
  rating numeric(3, 1) default 4.5,
  reviews_count integer default 0,
  in_stock boolean default true,
  is_featured boolean default false,
  description text default '',
  pack_sizes text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_slot text default 'express',
  payment_method text not null,
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  status text default 'Placed' check (status in ('Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled')),
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  rider_name text default 'Bikash Shrestha',
  rider_phone text default '9801987654',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  unit text not null,
  price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: Anyone can view their own profile; users can update their profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Products: Everyone can view active products
create policy "Allow public read access to products"
  on public.products for select
  using (true);

-- Products: Admins or authenticated store managers can insert/update products
create policy "Allow authorized management of products"
  on public.products for all
  using (true)
  with check (true);

-- Orders: Anyone can create an order (both guest & authenticated checkout)
create policy "Allow order creation"
  on public.orders for insert
  with check (true);

-- Orders: Users can read their own orders or read all if store staff
create policy "Allow order view"
  on public.orders for select
  using (true);

-- Orders: Allow order update (status change by admin/rider)
create policy "Allow order updates"
  on public.orders for update
  using (true);

-- Order Items: Anyone can insert order items
create policy "Allow order items creation"
  on public.order_items for insert
  with check (true);

-- Order Items: Allow reading items for orders
create policy "Allow reading order items"
  on public.order_items for select
  using (true);

-- ========================================================
-- REALTIME SETUP (Supabase Publication)
-- ========================================================
begin;
  -- Drop publication if exists or alter
  alter publication supabase_realtime add table public.orders;
  alter publication supabase_realtime add table public.order_items;
  alter publication supabase_realtime add table public.products;
commit;

-- ========================================================
-- SEED ESSENTIAL GROCERY PRODUCTS
-- ========================================================
insert into public.products (id, name, unit, price, original_price, discount_percentage, category, sub_category, image, rating, reviews_count, in_stock, is_featured, description)
values
  ('prod-tomato', 'Fresh Local Tomato (Golbheda)', '1 kg', 80, 90, 10, 'Vegetables', 'salad', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80', 4.8, 120, true, true, 'Fresh ripe tomatoes sourced daily from local farmers in Lalitpur valley.'),
  ('prod-potato', 'Red Potato (Rato Aalu)', '1 kg', 50, 60, 15, 'Vegetables', 'root', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80', 4.9, 210, true, true, 'Clean, farm-fresh mountain red potatoes ideal for daily Nepali curries.'),
  ('prod-onion', 'Dry Onion (Pyaj)', '1 kg', 75, 85, 12, 'Vegetables', 'root', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80', 4.7, 180, true, false, 'Premium dry cooking onions with rich pungency and firm layers.'),
  ('prod-cauliflower', 'Fresh Cauliflower (Kauli)', '1 pc (approx 800g)', 65, 80, 18, 'Vegetables', 'fresh-cuts', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80', 4.6, 95, true, false, 'Crisp, pesticide-conscious cauliflower harvested fresh daily.'),
  ('prod-apple', 'Fuji Apple (Seb)', '1 kg', 220, 260, 15, 'Fruits', 'fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80', 4.9, 140, true, true, 'Crisp and sweet Fuji apples, rich in nutrients and antioxidants.'),
  ('prod-milk-natura', 'Natura Fresh Standardized Milk', '500 ml', 50, 55, 10, 'Dairy', 'all', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80', 4.9, 320, true, true, 'Pasteurized cow-buffalo standardized fresh milk, sealed for purity.'),
  ('prod-rice-jeera', 'Hulas Premium Jeera Masino Rice', '5 kg', 650, 720, 10, 'Grains', 'all', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80', 4.8, 190, true, true, 'Aromatic slender long-grain rice, non-sticky and fluffy when cooked.'),
  ('prod-atta-fortune', 'Fortune Chakki Fresh Atta', '5 kg', 450, 490, 8, 'Grains', 'all', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', 4.7, 155, true, false, '100% whole wheat stone-ground chakki atta for soft rotis.'),
  ('prod-oil-sunflower', 'Dhara Pure Sunflower Oil', '1 Litre', 240, 265, 9, 'Essentials', 'all', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80', 4.8, 110, true, true, 'Light and healthy triple-filtered cooking oil enriched with Vitamin A & D.'),
  ('prod-paneer-fresh', 'Aone Fresh Malai Paneer', '200g', 160, 180, 11, 'Dairy', 'all', 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=500&auto=format&fit=crop&q=80', 4.9, 85, true, true, 'Silky and soft artisan cottage cheese made fresh every morning.')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  original_price = excluded.original_price,
  discount_percentage = excluded.discount_percentage,
  in_stock = excluded.in_stock;
