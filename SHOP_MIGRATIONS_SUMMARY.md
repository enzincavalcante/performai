# Shop and Missing Tables Migrations Summary

This document describes the new migration files created to support the shop functionality and other missing database tables.

## New Migration Files

### 1. `20250625000001-create-shop-tables.sql`
Creates all shop-related tables:

**Tables Created:**
- `single_shop_items` - Individual shop items (purchased with points)
  - Fields: id, title, description, price, avatar, quantity, created_at, updated_at
- `group_shop_items` - Team shop items (purchased with team treasury_balance)
  - Fields: id, title, description, price, avatar, quantity, created_at, updated_at
- `gem_shop_items` - Secret Shop items (purchased with crystalls)
  - Fields: id, title, description, price, avatar, quantity, created_at, updated_at
- `group_shop_purchases` - Purchase history for group shop
  - Fields: id, user_id, item_id, item_name, item_cost, purchased_at
- `gem_shop_purchases` - Purchase history for gem shop
  - Fields: id, user_id, item_id, item_name, item_cost, purchased_at

**RLS Policies:**
- Public read access for all shop items
- Team leaders can manage (insert/update/delete) shop items
- Users can view and insert their own purchases

**Indexes:**
- Indexes on purchase tables for user_id and item_id

### 2. `20250625000002-create-missing-tables.sql`
Creates other missing tables referenced in the codebase:

**Tables Created:**
- `friendships` - User friendships system
  - Fields: id, user_id, friend_id, status, created_at, updated_at
  - Unique constraint on (user_id, friend_id)
- `private_messages` - Private messaging between users
  - Fields: id, sender_id, recipient_id, subject, message, is_read, created_at
- `organization_forum_topics` - Forum topics for teams
  - Fields: id, team_id, created_by, title, content, created_at, updated_at
- `organization_forum_replies` - Replies to forum topics
  - Fields: id, topic_id, user_id, content, created_at
- `team_notification_settings` - Notification preferences for teams
  - Fields: id, team_id, notify_stage_completion, notify_purchases, notify_new_members, notify_rank_changes, created_at, updated_at

**RLS Policies:**
- Users can view/manage their own friendships
- Users can view messages they sent/received
- Team members can view/create forum topics and replies
- Team leaders can manage notification settings

**Indexes:**
- Indexes on foreign keys and commonly queried fields

### 3. `20250625000003-add-crystalls-to-profiles.sql`
Ensures the `crystalls` field exists in the profiles table:

- Adds `crystalls INTEGER DEFAULT 0` if it doesn't exist
- Updates existing NULL values to 0

### 4. `20250625000004-create-missing-functions.sql`
Creates missing database functions and ensures proper enum types:

**Functions:**
- `get_topic_team_id(topic_id_param uuid)` - Returns team_id for a forum topic

**Enums:**
- Ensures `user_role` enum exists with values: 'manager', 'closer'

**Schema Updates:**
- Ensures `profiles.role` column exists and uses the `user_role` enum type

## Migration Order

Run these migrations in this order (after all existing migrations):

1. `20250625000001-create-shop-tables.sql`
2. `20250625000002-create-missing-tables.sql`
3. `20250625000003-add-crystalls-to-profiles.sql`
4. `20250625000004-create-missing-functions.sql`

## What These Migrations Fix

### Shop Functionality
- ✅ Single shop (points-based purchases)
- ✅ Group shop (team treasury-based purchases)
- ✅ Secret shop / Gem shop (crystalls-based purchases)
- ✅ Purchase history tracking for all shop types
- ✅ Quantity management for shop items

### Missing Features
- ✅ Friendships system
- ✅ Private messaging
- ✅ Organization forum (topics and replies)
- ✅ Team notification settings
- ✅ Crystalls currency support

### Database Integrity
- ✅ Proper RLS policies for all new tables
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Enum types properly configured

## Testing Checklist

After running these migrations:

- [ ] Can view shop items (single, group, gem)
- [ ] Team leaders can add/edit shop items
- [ ] Users can purchase items from single shop (deducts points)
- [ ] Users can purchase items from group shop (deducts treasury_balance)
- [ ] Users can purchase items from gem shop (deducts crystalls)
- [ ] Purchase history is recorded correctly
- [ ] Quantity decreases when items are purchased
- [ ] Friendships can be created/updated
- [ ] Private messages can be sent/received
- [ ] Forum topics and replies work
- [ ] Team notification settings can be managed
- [ ] RLS policies prevent unauthorized access

## Notes

- All migrations use `CREATE TABLE IF NOT EXISTS` and `CREATE POLICY IF NOT EXISTS` where appropriate to be idempotent
- The shop RLS policies check for team leadership via `team_members.role = 'leader'` or `teams.created_by = auth.uid()`
- The `crystalls` field defaults to 0 for new users
- All tables have proper foreign key relationships and cascade deletes where appropriate
