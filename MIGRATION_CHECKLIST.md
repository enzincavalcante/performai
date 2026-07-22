# Migration Checklist

Use this checklist to track your migration progress.

## Pre-Migration ✅
- [x] Auth is working (keys are correct)

## Step 1: Prepare Base Schema
- [ ] Create base tables if needed (profiles, point_transactions, shop_purchases, player_stages)
- [ ] Verify new Supabase project is empty/ready

## Step 2: Run Migrations (27 files)
Run these in chronological order:

- [ ] `20250616122813-64f70e85-7937-4ade-b59d-65b05d06f9e4.sql` - RLS for profiles, transactions, shop
- [ ] `20250616123915-e8a7877d-dd3a-49be-87ad-91ea6d4d6ad6.sql` - Teams, team_members, chat_messages
- [ ] `20250616125132-57b637c1-037d-4453-a419-a03d6f5d1882.sql` - Foreign key for chat_messages
- [ ] `20250616125415-c9107754-8a8d-4b2b-a5f5-3fb1c3956964.sql` - Fix team_members policies
- [ ] `20250616125630-130073b8-26b2-4da0-a6c4-b4bc5a467dbf.sql` - is_team_member function
- [ ] `20250616125820-enable-rls-and-optimize.sql` - RLS for chat, teams, indexes
- [ ] `20250616130350-f815e628-fc14-470c-a491-8a9d3177595d.sql` - is_user_team_member function
- [ ] `20250616130516-79ac240c-3b23-442c-ac27-868e629991c9.sql` - Team creator policies
- [ ] `20250616131502-37c52a80-cece-4414-a9c3-5cdd53fa103d.sql` - (check content)
- [ ] `20250617091527-e1bdfde1-925f-4a0b-9950-22c83c8d8dbd.sql` - Clean up policies
- [ ] `20250617092752-10399a32-b1ad-431e-a448-dae89102352f.sql` - (check content)
- [ ] `20250617093329-5d73013e-deea-4e68-b010-8e5bbc6ec780.sql` - (check content)
- [ ] `20250617113859-398ba111-1f33-4b86-a56e-e257a914daa4.sql` - (check content)
- [ ] `20250617114638-57f523ec-c223-4fb5-98f3-6541bf07f0be.sql` - (check content)
- [ ] `20250617115744-dd13f95c-58f8-4e88-85ca-666304faeba5.sql` - (check content)
- [ ] `20250617120023-ec05b7af-a545-4a9b-bb38-a0ae49a12139.sql` - (check content)
- [ ] `20250617121242-ff9f294e-aa22-4d3b-83bc-d8a595f5bd49.sql` - (check content)
- [ ] `20250617121835-f8b3ce93-5931-4765-b3da-1f897cce5bb8.sql` - Treasury transactions
- [ ] `20250617122530-6405903c-dc3f-4451-aecb-2dd0947dded0.sql` - (check content)
- [ ] `20250617123208-1c72e6ad-5ce2-494c-a438-1144e1198202.sql` - (check content)
- [ ] `20250617123328-48091968-4ddb-491c-ba0f-c539b7f79edc.sql` - (check content)
- [ ] `20250617123714-463cc21b-abae-4500-a627-f4542fe55c85.sql` - (check content)
- [ ] `20250617125506-8bf2d3c3-7cb4-48e6-bd29-5e25a10201dd.sql` - (check content)
- [ ] `20250617125737-2eec7d29-1904-4ae4-a435-ae06344e1902.sql` - (check content)
- [ ] `20250617130052-131bc7f2-d5c4-4b17-a6f4-621b4cd49bdf.sql` - (check content)
- [ ] `20250624090037-5437b5ad-8963-4350-851b-ae180785c0a5.sql` - Shared stages, role column
- [ ] `20250624121034-6e1db2a2-4d20-46a7-bca0-c047e9ac1b9d.sql` - Cleanup unused functions

## Step 3: Update Configuration
- [ ] Update `supabase/config.toml` with new project_id
- [ ] Verify `src/integrations/supabase/client.ts` has correct URL and key (already done ✅)

## Step 4: Regenerate Types
- [ ] Regenerate TypeScript types from new database
- [ ] Verify `src/integrations/supabase/types.ts` is updated

## Step 5: Testing
- [ ] Test user registration/login
- [ ] Test profile creation
- [ ] Test creating teams
- [ ] Test database queries
- [ ] Test RLS policies work correctly
- [ ] Test all major features

## Quick Commands Reference

### Using Supabase CLI (if installed):
```bash
# Link to new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push migrations
supabase db push

# Generate types
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Using Supabase Dashboard:
1. Go to SQL Editor
2. Copy/paste each migration file
3. Run in order
4. Go to Settings → API → Copy TypeScript types
