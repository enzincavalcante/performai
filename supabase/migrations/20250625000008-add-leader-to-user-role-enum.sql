-- Add 'leader' value to user_role enum if it doesn't exist
-- Note: This must be run outside of a transaction block in some PostgreSQL versions
-- If you get an error, run this command directly in SQL Editor:
-- ALTER TYPE public.user_role ADD VALUE 'leader';

DO $$ 
BEGIN
    -- Check if enum exists and 'leader' value doesn't exist
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'leader' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
        ) THEN
            -- Try to add 'leader' to the enum
            -- This may fail in some PostgreSQL versions - if so, run the command above directly
            EXECUTE 'ALTER TYPE public.user_role ADD VALUE ''leader''';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If it fails, the user needs to run: ALTER TYPE public.user_role ADD VALUE 'leader';
        RAISE NOTICE 'Could not add leader to enum in transaction. Please run: ALTER TYPE public.user_role ADD VALUE ''leader'';';
END $$;
