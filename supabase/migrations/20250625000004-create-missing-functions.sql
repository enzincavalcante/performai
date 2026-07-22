-- Create get_topic_team_id function
CREATE OR REPLACE FUNCTION public.get_topic_team_id(topic_id_param uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT team_id 
  FROM public.organization_forum_topics 
  WHERE id = topic_id_param;
$$;

-- Ensure user_role enum exists with all values including 'leader'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('manager', 'closer', 'leader');
    ELSE
        -- If enum exists but doesn't have 'leader', add it
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'leader' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
        ) THEN
            ALTER TYPE public.user_role ADD VALUE 'leader';
        END IF;
    END IF;
END $$;

-- Ensure profiles.role column uses the enum type (if it exists but is wrong type)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' 
               AND column_name = 'role' 
               AND table_schema = 'public'
               AND data_type != 'USER-DEFINED') THEN
        -- Column exists but is not enum type, alter it
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'profiles' 
                      AND column_name = 'role' 
                      AND table_schema = 'public') THEN
        -- Column doesn't exist, add it
        ALTER TABLE public.profiles 
        ADD COLUMN role public.user_role DEFAULT 'manager';
    END IF;
END $$;

-- Update Constants export to include 'leader' (this is just a comment for reference)
-- The actual enum now includes: 'manager', 'closer', 'leader'
