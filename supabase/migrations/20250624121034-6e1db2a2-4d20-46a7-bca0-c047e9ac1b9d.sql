
-- Удаляем неиспользуемые функции и таблицы
DROP FUNCTION IF EXISTS public.manage_transaction_types();
DROP FUNCTION IF EXISTS public.stage_management_policy();
DROP FUNCTION IF EXISTS public.treasury_management();
DROP FUNCTION IF EXISTS public.team_membership_management();
DROP FUNCTION IF EXISTS public.manage_policies_for_team();
DROP FUNCTION IF EXISTS public.update_team_rankings();
DROP FUNCTION IF EXISTS public.user_search_function();
DROP FUNCTION IF EXISTS public.update_profiles_table();
DROP FUNCTION IF EXISTS public.forum_management_policies();
DROP FUNCTION IF EXISTS public.forum_replies_table();

-- Удаляем неиспользуемые политики RLS (если они существуют)
DROP POLICY IF EXISTS "manage_transaction_types_policy" ON public.point_transactions;
DROP POLICY IF EXISTS "stage_management_policy" ON public.player_stages;
DROP POLICY IF EXISTS "treasury_management_policy" ON public.treasury_transactions;
DROP POLICY IF EXISTS "team_membership_policy" ON public.team_members;

-- Удаляем политику для team_notification_settings только если таблица существует
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'team_notification_settings') THEN
        DROP POLICY IF EXISTS "team_notification_policy" ON public.team_notification_settings;
    END IF;
END $$;

-- Удаляем политики для таблиц, которые могут не существовать
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'private_messages') THEN
        DROP POLICY IF EXISTS "private_messages_policy" ON public.private_messages;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'friendships') THEN
        DROP POLICY IF EXISTS "friendships_policy" ON public.friendships;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'organization_forum_topics') THEN
        DROP POLICY IF EXISTS "forum_topics_policy" ON public.organization_forum_topics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'organization_forum_replies') THEN
        DROP POLICY IF EXISTS "forum_replies_policy" ON public.organization_forum_replies;
    END IF;
END $$;

-- Очищаем от устаревших триггеров (если они есть)
DROP TRIGGER IF EXISTS manage_transaction_types_trigger ON public.point_transactions;
DROP TRIGGER IF EXISTS stage_management_trigger ON public.player_stages;
DROP TRIGGER IF EXISTS treasury_management_trigger ON public.treasury_transactions;
DROP TRIGGER IF EXISTS team_membership_trigger ON public.team_members;

-- Удаляем тестовую таблицу, если она не используется
DROP TABLE IF EXISTS public.table_name;
