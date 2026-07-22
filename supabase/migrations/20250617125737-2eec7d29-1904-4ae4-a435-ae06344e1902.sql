
-- Добавляем внешний ключ для связи с таблицей profiles
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
