
-- Проверяем и создаем только отсутствующие компоненты

-- Добавляем колонку роли в таблицу profiles (если ее еще нет)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'role' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role public.user_role DEFAULT 'manager';
    END IF;
END $$;

-- Создаем таблицу для разделенных этапов (если ее еще нет)
CREATE TABLE IF NOT EXISTS public.shared_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.player_stages(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  points_received INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT
);

-- Добавляем RLS для shared_stages
ALTER TABLE public.shared_stages ENABLE ROW LEVEL SECURITY;

-- Создаем политики только если их еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'shared_stages' 
                   AND policyname = 'Users can view shared stages they are involved in') THEN
        CREATE POLICY "Users can view shared stages they are involved in" 
          ON public.shared_stages 
          FOR SELECT 
          USING (
            shared_with_user_id = auth.uid() OR 
            created_by = auth.uid() OR
            stage_id IN (
              SELECT id FROM public.player_stages WHERE user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'shared_stages' 
                   AND policyname = 'Users can create shared stages for their stages') THEN
        CREATE POLICY "Users can create shared stages for their stages" 
          ON public.shared_stages 
          FOR INSERT 
          WITH CHECK (
            created_by = auth.uid() AND
            stage_id IN (
              SELECT id FROM public.player_stages WHERE user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Создаем функцию для разделения этапа между пользователями
CREATE OR REPLACE FUNCTION public.share_stage_with_users(
  stage_id_param UUID,
  user_ids UUID[],
  description_param TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  stage_record RECORD;
  user_id UUID;
  share_percentage DECIMAL(5,2);
  points_per_user INTEGER;
  total_users INTEGER;
BEGIN
  -- Получаем информацию об этапе
  SELECT * INTO stage_record
  FROM public.player_stages
  WHERE id = stage_id_param AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Этап не найден или у вас нет прав на его разделение';
  END IF;
  
  -- Проверяем, что этап еще не был разделен
  IF EXISTS (SELECT 1 FROM public.shared_stages WHERE stage_id = stage_id_param) THEN
    RAISE EXCEPTION 'Этот этап уже был разделен';
  END IF;
  
  total_users := array_length(user_ids, 1);
  
  IF total_users IS NULL OR total_users = 0 THEN
    RAISE EXCEPTION 'Необходимо указать хотя бы одного пользователя для разделения';
  END IF;
  
  -- Вычисляем процент и баллы на каждого пользователя
  share_percentage := 100.0 / (total_users + 1); -- +1 для создателя этапа
  points_per_user := FLOOR(stage_record.points / (total_users + 1));
  
  -- Создаем записи о разделении для каждого пользователя
  FOREACH user_id IN ARRAY user_ids
  LOOP
    -- Проверяем, что пользователь существует и состоит в той же команде
    IF NOT EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = user_id AND tm2.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Пользователь % не найден или не состоит в вашей команде', user_id;
    END IF;
    
    -- Добавляем запись о разделении
    INSERT INTO public.shared_stages (
      stage_id, 
      shared_with_user_id, 
      share_percentage, 
      points_received, 
      created_by, 
      description
    )
    VALUES (
      stage_id_param, 
      user_id, 
      share_percentage, 
      points_per_user, 
      auth.uid(), 
      description_param
    );
    
    -- Добавляем баллы пользователю
    INSERT INTO public.point_transactions (user_id, points, transaction_type, description)
    VALUES (user_id, points_per_user, 'разделение_этапа', 
            'Разделение этапа "' || stage_record.stage_name || '"');
    
    -- Обновляем баллы в профиле
    UPDATE public.profiles 
    SET 
      points = points + points_per_user,
      total_deals = total_deals + 1,
      updated_at = NOW()
    WHERE id = user_id;
  END LOOP;
  
  -- Обновляем ранги для всех затронутых пользователей
  PERFORM public.update_user_ranks_after_points_change(unnest(user_ids));
  
  -- Логируем успешное выполнение
  RAISE NOTICE 'Этап успешно разделен между % пользователями', total_users;
END;
$$;

-- Функция для обновления рангов после изменения баллов
CREATE OR REPLACE FUNCTION public.update_user_ranks_after_points_change(user_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_id UUID;
  new_points INTEGER;
  new_rank_level INTEGER;
  new_rank_title TEXT;
BEGIN
  FOREACH user_id IN ARRAY user_ids
  LOOP
    -- Получаем текущие баллы пользователя
    SELECT points INTO new_points
    FROM public.profiles
    WHERE id = user_id;
    
    -- Определяем новый ранг
    SELECT 
      CASE 
        WHEN new_points >= 10000 THEN 5
        WHEN new_points >= 5000 THEN 4
        WHEN new_points >= 2000 THEN 3
        WHEN new_points >= 500 THEN 2
        ELSE 1
      END,
      CASE 
        WHEN new_points >= 10000 THEN 'Директор по продажам'
        WHEN new_points >= 5000 THEN 'Старший менеджер'
        WHEN new_points >= 2000 THEN 'Менеджер'
        WHEN new_points >= 500 THEN 'Младший менеджер'
        ELSE 'Стажер'
      END
    INTO new_rank_level, new_rank_title;
    
    -- Обновляем ранг
    UPDATE public.profiles 
    SET 
      rank_level = new_rank_level,
      rank_title = new_rank_title,
      updated_at = NOW()
    WHERE id = user_id;
  END LOOP;
END;
$$;
