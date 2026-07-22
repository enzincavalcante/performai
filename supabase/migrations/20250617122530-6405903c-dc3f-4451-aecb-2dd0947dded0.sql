
-- Удаляем все существующие политики перед созданием новых
DROP POLICY IF EXISTS "Team members can add stages for themselves" ON public.player_stages;
DROP POLICY IF EXISTS "Team leaders can manage stages" ON public.player_stages;
DROP POLICY IF EXISTS "Team leaders can delete stages" ON public.player_stages;

-- Создаем политику для добавления этапов - участники могут добавлять этапы для себя
CREATE POLICY "Team members can add stages for themselves" 
  ON public.player_stages 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

-- Создаем политику для удаления этапов - только руководители и админы могут удалять
CREATE POLICY "Team leaders can delete stages" 
  ON public.player_stages 
  FOR DELETE 
  USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('leader', 'admin')
    )
  );

-- Обновляем функцию для самостоятельного добавления этапов участниками
CREATE OR REPLACE FUNCTION public.add_stage_for_self(
  stage_name_param text,
  points_param integer,
  description_param text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_team_id UUID;
  new_points INTEGER;
  new_rank_level INTEGER;
  new_rank_title TEXT;
  treasury_amount DECIMAL(10,2) := 0;
  transaction_type_to_use TEXT := 'бонус';  -- Используем допустимый тип транзакции
BEGIN
  -- Получаем team_id текущего пользователя
  SELECT tm.team_id INTO user_team_id
  FROM public.team_members tm
  WHERE tm.user_id = auth.uid();
  
  IF user_team_id IS NULL THEN
    RAISE EXCEPTION 'Пользователь не состоит ни в одной команде';
  END IF;
  
  -- Определяем сумму для казны в зависимости от этапа
  IF stage_name_param = 'Залог' THEN
    treasury_amount := 100.00;
  ELSIF stage_name_param = 'Почтовые сборы' THEN
    treasury_amount := 50.00;
  END IF;
  
  -- Добавляем транзакцию баллов с допустимым типом
  INSERT INTO public.point_transactions (user_id, points, transaction_type, description)
  VALUES (auth.uid(), points_param, transaction_type_to_use, description_param);
  
  -- Добавляем этап
  INSERT INTO public.player_stages (user_id, stage_name, points, added_by, team_id, description)
  VALUES (auth.uid(), stage_name_param, points_param, auth.uid(), user_team_id, description_param);
  
  -- Если есть сумма для казны, добавляем транзакцию казны и обновляем баланс
  IF treasury_amount > 0 THEN
    -- Добавляем транзакцию в казну
    INSERT INTO public.treasury_transactions (team_id, user_id, stage_name, amount, description)
    VALUES (user_team_id, auth.uid(), stage_name_param, treasury_amount, description_param);
    
    -- Обновляем баланс казны команды
    UPDATE public.teams 
    SET treasury_balance = treasury_balance + treasury_amount
    WHERE id = user_team_id;
  END IF;
  
  -- Обновляем баллы в профиле
  UPDATE public.profiles 
  SET 
    points = points + points_param,
    total_deals = CASE WHEN points_param > 0 THEN total_deals + 1 ELSE total_deals END,
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING points INTO new_points;
  
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
  WHERE id = auth.uid();
  
  -- Логируем успешное выполнение
  RAISE NOTICE 'Успешно добавлен этап для пользователя %: %', auth.uid(), stage_name_param;
END;
$$;
