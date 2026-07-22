
-- Обновляем функцию поиска пользователей для корректного поиска по частичному совпадению
CREATE OR REPLACE FUNCTION public.find_user_by_username(username_param text)
RETURNS TABLE(user_id uuid, username text, full_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT id, username, full_name
  FROM public.profiles
  WHERE username ILIKE '%' || username_param || '%'
     OR full_name ILIKE '%' || username_param || '%'
  LIMIT 10;
$function$
