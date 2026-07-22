-- Add custom_rank column to team_members table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_members' 
                   AND column_name = 'custom_rank' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.team_members 
        ADD COLUMN custom_rank TEXT;
    END IF;
END $$;
