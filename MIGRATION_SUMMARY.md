# Supabase Migration Summary

## Current Status
- ✅ Auth is working (you mentioned keys are correct)
- ⚠️ Note: `client.ts` still shows old project URL - make sure you've updated it to your new project

## What Needs to Be Done

### 1. Run All Database Migrations (27 files)

You need to apply all 27 migration files to your new Supabase project in chronological order. The migrations include:

- **Base schema**: profiles, point_transactions, shop_purchases, player_stages
- **Teams**: teams, team_members tables and policies
- **Chat**: chat_messages table
- **Forum**: organization_forum_topics, organization_forum_replies
- **Friendships**: friendships table
- **Private messages**: private_messages table
- **Treasury**: treasury_transactions table
- **Shared stages**: shared_stages table
- **RLS policies**: Row Level Security for all tables
- **Functions**: Various helper functions for team management, points, etc.
- **Enums**: user_role enum (manager/closer)

### 2. Update Configuration Files

- **`supabase/config.toml`**: Update `project_id` to your new project ID
- **`src/integrations/supabase/client.ts`**: Verify URL and key are correct (you said this is done ✅)

### 3. Regenerate TypeScript Types

After migrations are complete, regenerate `src/integrations/supabase/types.ts` from your new database schema.

## Migration Methods

### Option A: Supabase Dashboard (Easiest)
1. Go to your new Supabase project → SQL Editor
2. Copy each migration file content
3. Paste and run them one by one in chronological order
4. Check for any errors

### Option B: Supabase CLI (Recommended if available)
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push all migrations at once
supabase db push

# Generate types
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

### Option C: Manual SQL Script
You can combine all migrations into one file, but be careful - test first!

## Important Notes

1. **Migration Order Matters**: Migrations must be run in chronological order (by timestamp in filename)
2. **Base Tables**: The first migration assumes `profiles`, `point_transactions`, and `shop_purchases` exist. If your project is completely empty, you may need to create these first (see MIGRATION_GUIDE.md)
3. **RLS Policies**: Many migrations modify RLS policies - this is intentional
4. **Idempotency**: Some migrations use `IF NOT EXISTS` but not all - be careful when re-running
5. **Last Migration**: The final migration (`20250624121034`) cleans up unused functions and policies

## Files to Check After Migration

- ✅ `src/integrations/supabase/client.ts` - Should have new project URL/key
- ✅ `supabase/config.toml` - Should have new project_id
- ✅ `src/integrations/supabase/types.ts` - Should be regenerated from new schema

## Testing Checklist

After migration:
- [ ] User can register/login
- [ ] Profile is created automatically on signup
- [ ] Can create teams
- [ ] Can add team members
- [ ] Can send chat messages
- [ ] Can create forum topics
- [ ] Can add stages/points
- [ ] RLS policies work (users can only see their own data where appropriate)

## Getting Help

If migrations fail:
1. Check the error message - it usually tells you what's wrong
2. Some migrations can be safely re-run (they use IF NOT EXISTS)
3. Check if base tables exist before running first migration
4. Verify your Supabase project has the correct permissions

## Next Steps

1. Read `MIGRATION_GUIDE.md` for detailed instructions
2. Use `MIGRATION_CHECKLIST.md` to track progress
3. Run migrations in order
4. Update config files
5. Regenerate types
6. Test everything
