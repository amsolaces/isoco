-- ==========================================
-- DRIPEGO — Clerk Authentication Integration SQL Migration
-- Run this script in your Supabase SQL Editor.
-- ==========================================

-- 1. CREATE PROFILES MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    gender TEXT, -- 'men', 'women', 'unisex'
    dob DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. MIGRATE EXISTING SUPABASE AUTH USERS (IF ANY) TO PROFILES TABLE
-- This copies existing user records and metadata to preserve their relationships
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO public.profiles (id, email, first_name, last_name, phone, gender, dob, created_at, updated_at)
        SELECT 
            id,
            email,
            split_part(raw_user_meta_data->>'full_name', ' ', 1) as first_name,
            substring(raw_user_meta_data->>'full_name' from position(' ' in raw_user_meta_data->>'full_name') + 1) as last_name,
            raw_user_meta_data->>'phone',
            raw_user_meta_data->>'gender',
            CASE 
                WHEN raw_user_meta_data->>'dob' IS NOT NULL AND raw_user_meta_data->>'dob' <> '' 
                THEN (raw_user_meta_data->>'dob')::date 
                ELSE NULL 
            END,
            created_at,
            COALESCE(updated_at, created_at)
        FROM auth.users
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 3. REDIRECT FOREIGN KEY CONSTRAINTS TO PROFILES(ID)
-- Alter orders table constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Alter user_roles table constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_id_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_id_fkey
    FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Alter activity_logs table constraint
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_admin_id_fkey;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Drop old trigger on auth.users if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. CREATE CLERK UTILITY FUNCTIONS
-- Helper function to extract Clerk user ID from JWT
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT SECURITY DEFINER AS $$
BEGIN
    RETURN (auth.jwt() ->> 'sub')::text;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if current Clerk user has admin rights
CREATE OR REPLACE FUNCTION public.is_admin_clerk()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.user_roles r ON r.id = p.id
        WHERE p.clerk_user_id = public.clerk_user_id()
          AND r.role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER ON NEW PROFILES TO AUTOMATICALLY ASSIGN USER ROLE
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin')) THEN
        INSERT INTO public.user_roles (id, role)
        VALUES (NEW.id, 'super_admin');
    ELSE
        INSERT INTO public.user_roles (id, role)
        VALUES (NEW.id, 'customer');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- 6. TRIGGER ON NEW ORDERS TO SECURELY SET CUSTOMER IDENTITY
CREATE OR REPLACE FUNCTION public.set_order_customer()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    SELECT id INTO v_profile_id FROM public.profiles 
    WHERE clerk_user_id = public.clerk_user_id();
    
    IF v_profile_id IS NOT NULL THEN
        NEW.customer_id := v_profile_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_order_customer();

-- 7. RE-WRITE ROW LEVEL SECURITY (RLS) POLICIES FOR CLERK IDENTITY

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (clerk_user_id = public.clerk_user_id() OR public.is_admin_clerk());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (clerk_user_id = public.clerk_user_id() OR public.is_admin_clerk());

DROP POLICY IF EXISTS "Anyone can register a profile" ON public.profiles;
CREATE POLICY "Anyone can register a profile" ON public.profiles
    FOR INSERT WITH CHECK (clerk_user_id = public.clerk_user_id() OR public.clerk_user_id() IS NULL);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin_clerk());

-- Products RLS Policies
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT USING (status = 'published'::public.product_status OR public.is_admin_clerk());

DROP POLICY IF EXISTS "Admins can perform all modifications on products" ON public.products;
CREATE POLICY "Admins can perform all modifications on products" ON public.products
    FOR ALL USING (public.is_admin_clerk());

-- Categories RLS Policies
DROP POLICY IF EXISTS "Admins can perform all modifications on categories" ON public.categories;
CREATE POLICY "Admins can perform all modifications on categories" ON public.categories
    FOR ALL USING (public.is_admin_clerk());

-- User Roles RLS Policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_admin_clerk());

DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles" ON public.user_roles
    FOR ALL USING (
        id IN (
            SELECT id FROM public.profiles 
            WHERE clerk_user_id = public.clerk_user_id()
        ) 
        OR public.is_admin_clerk()
    );

-- Orders RLS Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM public.profiles 
            WHERE clerk_user_id = public.clerk_user_id()
        ) 
        OR public.is_admin_clerk()
    );

DROP POLICY IF EXISTS "Admins can edit/view all orders" ON public.orders;
CREATE POLICY "Admins can edit/view all orders" ON public.orders
    FOR ALL USING (public.is_admin_clerk());

-- Order Items RLS Policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND (
                customer_id IN (
                    SELECT id FROM public.profiles 
                    WHERE clerk_user_id = public.clerk_user_id()
                )
                OR public.is_admin_clerk()
            )
        )
    );

DROP POLICY IF EXISTS "Admins can modify all order items" ON public.order_items;
CREATE POLICY "Admins can modify all order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND public.is_admin_clerk()
        )
    );

-- Waitlist RLS Policies
DROP POLICY IF EXISTS "Admins can view and edit waitlist" ON public.waitlist;
CREATE POLICY "Admins can view and edit waitlist" ON public.waitlist
    FOR ALL USING (public.is_admin_clerk());

-- Inventory Logs RLS Policies
DROP POLICY IF EXISTS "Admins can manage inventory logs" ON public.inventory_logs;
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
    FOR ALL USING (public.is_admin_clerk());

-- Content Settings RLS Policies
DROP POLICY IF EXISTS "Admins can modify content settings" ON public.content_settings;
CREATE POLICY "Admins can modify content settings" ON public.content_settings
    FOR ALL USING (public.is_admin_clerk());

-- Media Library RLS Policies
DROP POLICY IF EXISTS "Admins can manage media" ON public.media_library;
CREATE POLICY "Admins can manage media" ON public.media_library
    FOR ALL USING (public.is_admin_clerk());

-- Activity Logs RLS Policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
    FOR ALL USING (public.is_admin_clerk());
