
-- Удаляем проблемный внешний ключ
ALTER TABLE public.chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_profiles_fkey;

-- Добавляем правильный внешний ключ, который допускает NULL значения для системных сообщений
ALTER TABLE public.chat_messages 
ALTER COLUMN user_id DROP NOT NULL;

-- Обновляем функцию отправки уведомлений, чтобы использовать NULL вместо системного UUID
CREATE OR REPLACE FUNCTION public.send_team_notification(team_id_param uuid, message_text text, notification_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  settings_enabled BOOLEAN := true;
BEGIN
  -- Проверяем настройки уведомлений
  SELECT 
    CASE notification_type
      WHEN 'stage_completion' THEN notify_stage_completion
      WHEN 'purchase' THEN notify_purchases
      WHEN 'new_member' THEN notify_new_members
      WHEN 'rank_change' THEN notify_rank_changes
      ELSE true
    END
  INTO settings_enabled
  FROM public.team_notification_settings
  WHERE team_id = team_id_param;
  
  -- Если настройки не найдены, создаем их с дефолтными значениями
  IF NOT FOUND THEN
    INSERT INTO public.team_notification_settings (team_id)
    VALUES (team_id_param);
    settings_enabled := true;
  END IF;
  
  -- Отправляем уведомление если включено (используем NULL для системных сообщений)
  IF settings_enabled THEN
    INSERT INTO public.chat_messages (team_id, user_id, message)
    VALUES (
      team_id_param,
      NULL, -- системное сообщение без привязки к пользователю
      message_text
    );
  END IF;
END;
$function$;
