-- Set default role 'manager' for existing users who don't have a role
UPDATE public.profiles 
SET role = 'manager'::public.user_role
WHERE role IS NULL;

-- Ensure role column has a default value for future inserts
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'manager'::public.user_role;
