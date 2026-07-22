-- Update handle_new_user function to set role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- Extract role from user metadata, default to 'manager' if not provided or invalid
  user_role_value := COALESCE(new.raw_user_meta_data ->> 'role', 'manager');
  
  -- Validate role - 'manager', 'closer', and 'leader' are valid enum values
  IF user_role_value NOT IN ('manager', 'closer', 'leader') THEN
    user_role_value := 'manager';
  END IF;
  
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    user_role_value::public.user_role
  );
  RETURN new;
END;
$$;
