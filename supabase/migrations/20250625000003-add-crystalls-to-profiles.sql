-- Add crystalls field to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'crystalls' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN crystalls INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing profiles to have 0 crystalls if NULL
UPDATE public.profiles 
SET crystalls = 0 
WHERE crystalls IS NULL;
