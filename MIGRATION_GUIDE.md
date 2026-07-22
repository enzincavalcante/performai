# Supabase Migration Guide

This guide will help you migrate your sales-arena-quest project from the old Supabase account to the new one.

## Prerequisites

✅ Auth is already working (keys are correct in `client.ts`)

## Steps to Complete Migration

### Step 1: Verify Your New Supabase Project

1. Go to your new Supabase project dashboard
2. Note your new project ID (you'll need this for `config.toml`)
3. Ensure you have the correct URL and anon key (already done ✅)

### Step 2: Create Base Tables (if needed)

The first migration assumes these tables already exist. If your new project is completely empty, you may need to create these base tables first:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  full_name TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  rank_level INTEGER NOT NULL DEFAULT 1,
  rank_title TEXT NOT NULL DEFAULT 'Стажер',
  total_deals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  avatar_id INTEGER,
  status TEXT,
  team_id UUID,
  role TEXT,
  crystalls INTEGER DEFAULT 0
);

-- Create point_transactions table
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_purchases table
CREATE TABLE public.shop_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_stages table
CREATE TABLE public.player_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  team_id UUID
);
```

### Step 3: Run All Migrations in Order

You have **27 migration files** that need to be run in chronological order. The migrations are named with timestamps, so they should be run in this order:

1. `20250616122813-64f70e85-7937-4ade-b59d-65b05d06f9e4.sql`
2. `20250616123915-e8a7877d-dd3a-49be-87ad-91ea6d4d6ad6.sql`
3. `20250616125132-57b637c1-037d-4453-a419-a03d6f5d1882.sql`
4. `20250616125415-c9107754-8a8d-4b2b-a5f5-3fb1c3956964.sql`
5. `20250616125630-130073b8-26b2-4da0-a6c4-b4bc5a467dbf.sql`
6. `20250616125820-enable-rls-and-optimize.sql`
7. `20250616130350-f815e628-fc14-470c-a491-8a9d3177595d.sql`
8. `20250616130516-79ac240c-3b23-442c-ac27-868e629991c9.sql`
9. `20250616131502-37c52a80-cece-4414-a9c3-5cdd53fa103d.sql`
10. `20250617091527-e1bdfde1-925f-4a0b-9950-22c83c8d8dbd.sql`
11. `20250617092752-10399a32-b1ad-431e-a448-dae89102352f.sql`
12. `20250617093329-5d73013e-deea-4e68-b010-8e5bbc6ec780.sql`
13. `20250617113859-398ba111-1f33-4b86-a56e-e257a914daa4.sql`
14. `20250617114638-57f523ec-c223-4fb5-98f3-6541bf07f0be.sql`
15. `20250617115744-dd13f95c-58f8-4e88-85ca-666304faeba5.sql`
16. `20250617120023-ec05b7af-a545-4a9b-bb38-a0ae49a12139.sql`
17. `20250617121242-ff9f294e-aa22-4d3b-83bc-d8a595f5bd49.sql`
18. `20250617121835-f8b3ce93-5931-4765-b3da-1f897cce5bb8.sql`
19. `20250617122530-6405903c-dc3f-4451-aecb-2dd0947dded0.sql`
20. `20250617123208-1c72e6ad-5ce2-494c-a438-1144e1198202.sql`
21. `20250617123328-48091968-4ddb-491c-ba0f-c539b7f79edc.sql`
22. `20250617123714-463cc21b-abae-4500-a627-f4542fe55c85.sql`
23. `20250617125506-8bf2d3c3-7cb4-48e6-bd29-5e25a10201dd.sql`
24. `20250617125737-2eec7d29-1904-4ae4-a435-ae06344e1902.sql`
25. `20250617130052-131bc7f2-d5c4-4b17-a6f4-621b4cd49bdf.sql`
26. `20250624090037-5437b5ad-8963-4350-851b-ae180785c0a5.sql`
27. `20250624121034-6e1db2a2-4d20-46a7-bca0-c047e9ac1b9d.sql`

**NEW: Shop and Missing Tables Migrations** (run after the above): 28. `20250625000001-create-shop-tables.sql` - Creates all shop tables (single, group, gem shops) 29. `20250625000002-create-missing-tables.sql` - Creates friendships, private_messages, forum tables, team_notification_settings 30. `20250625000003-add-crystalls-to-profiles.sql` - Adds crystalls field to profiles 31. `20250625000004-create-missing-functions.sql` - Creates get_topic_team_id function and ensures user_role enum 32. `20250625000005-add-custom-rank-to-team-members.sql` - Adds custom_rank column to team_members table 33. `20250625000006-fix-profile-role-on-registration.sql` - Updates handle_new_user to set role from registration metadata 34. `20250625000007-set-default-role-for-existing-users.sql` - Sets default role for existing users without roles 35. `20250625000008-add-leader-to-user-role-enum.sql` - Adds 'leader' value to user_role enum (run this if leader role selection doesn't work)

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content one by one in order
4. Run each migration

**Option B: Using Supabase CLI** (if you have it installed)

```bash
# Link to your new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push all migrations
supabase db push
```

**Option C: Using the Combined Script**
See `run-migrations.sql` file - this combines all migrations in order (use with caution, test first!)

### Step 4: Update config.toml

Update the `project_id` in `supabase/config.toml`:

```toml
project_id = "YOUR_NEW_PROJECT_ID"
```

### Step 5: Regenerate TypeScript Types

After all migrations are applied, regenerate your TypeScript types:

**Option A: Using Supabase CLI**

```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

**Option B: Using Supabase Dashboard**

1. Go to Settings → API
2. Copy the TypeScript types
3. Replace the content of `src/integrations/supabase/types.ts`

### Step 6: Verify Everything Works

1. Test authentication (already working ✅)
2. Test creating a profile
3. Test database queries
4. Check that all tables exist
5. Verify RLS policies are in place
6. Test shop functionality (single, group, gem shops)
7. Test friendships and private messages
8. Test forum (topics and replies)
9. Verify crystalls field exists in profiles

**See `SHOP_MIGRATIONS_SUMMARY.md` for details about the new shop migrations.**

## Troubleshooting

- **If migrations fail**: Check the error message. Some migrations use `IF NOT EXISTS` clauses, so they're safe to re-run
- **If tables already exist**: Some migrations check for existence, but if you get errors, you may need to manually adjust
- **If RLS policies conflict**: The later migrations clean up old policies, so run them in order

## Important Notes

- The migrations include RLS (Row Level Security) policies
- Some migrations drop and recreate policies - this is intentional
- The last migration (`20250624121034`) cleans up unused functions and policies
- Make sure to run migrations in the exact order listed above
