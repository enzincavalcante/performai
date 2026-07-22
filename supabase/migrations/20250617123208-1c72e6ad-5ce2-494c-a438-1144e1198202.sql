
-- Обновляем функцию manage_user_points_by_leader чтобы использовать допустимые типы транзакций
CREATE OR REPLACE FUNCTION public.manage_user_points_by_leader(
  target_user_id uuid, 
  points_to_add integer, 
  transaction_type_param text, 
  description_param text DEFAULT NULL::text, 
  stage_name_param text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  leader_team_id UUID;
  target_team_id UUID;
  new_points INTEGER;
  new_rank_level INTEGER;
  new_rank_title TEXT;
  treasury_amount DECIMAL(10,2) := 0;
  final_transaction_type TEXT;
BEGIN
  -- Получаем team_id текущего пользователя (руководителя/админа)
  SELECT tm.team_id INTO leader_team_id
  FROM public.team_members tm
  WHERE tm.user_id = auth.uid() 
  AND tm.role IN ('leader', 'admin');
  
  IF leader_team_id IS NULL THEN
    RAISE EXCEPTION 'Только руководители и администраторы могут управлять баллами участников';
  END IF;
  
  -- Получаем team_id целевого пользователя
  SELECT tm.team_id INTO target_team_id
  FROM public.team_members tm
  WHERE tm.user_id = target_user_id;
  
  IF target_team_id IS NULL THEN
    RAISE EXCEPTION 'Целевой пользователь не состоит ни в одной команде';
  END IF;
  
  IF target_team_id != leader_team_id THEN
    RAISE EXCEPTION 'Можно управлять баллами только участников своей команды';
  END IF;
  
  -- Определяем сумму для казны в зависимости от этапа
  IF stage_name_param = 'Залог' THEN
    treasury_amount := 100.00;
  ELSIF stage_name_param = 'Почтовые сборы' THEN
    treasury_amount := 50.00;
  END IF;
  
  -- Преобразуем тип транзакции в допустимый
  IF transaction_type_param = 'этап' THEN
    final_transaction_type := 'бонус';
  ELSE
    final_transaction_type := transaction_type_param;
  END IF;
  
  -- Добавляем транзакцию баллов
  INSERT INTO public.point_transactions (user_id, points, transaction_type, description)
  VALUES (target_user_id, points_to_add, final_transaction_type, description_param);
  
  -- Если это этап, добавляем в таблицу этапов
  IF stage_name_param IS NOT NULL THEN
    INSERT INTO public.player_stages (user_id, stage_name, points, added_by, team_id, description)
    VALUES (target_user_id, stage_name_param, points_to_add, auth.uid(), leader_team_id, description_param);
  END IF;
  
  -- Если есть сумма для казны, добавляем транзакцию казны и обновляем баланс
  IF treasury_amount > 0 THEN
    -- Добавляем транзакцию в казну
    INSERT INTO public.treasury_transactions (team_id, user_id, stage_name, amount, description)
    VALUES (leader_team_id, target_user_id, stage_name_param, treasury_amount, description_param);
    
    -- Обновляем баланс казны команды
    UPDATE public.teams 
    SET treasury_balance = treasury_balance + treasury_amount
    WHERE id = leader_team_id;
  END IF;
  
  -- Обновляем баллы в профиле
  UPDATE public.profiles 
  SET 
    points = points + points_to_add,
    total_deals = CASE WHEN points_to_add > 0 THEN total_deals + 1 ELSE total_deals END,
    updated_at = NOW()
  WHERE id = target_user_id
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
  WHERE id = target_user_id;
  
  -- Логируем успешное выполнение
  RAISE NOTICE 'Успешно обновлены баллы для пользователя %: % баллов', target_user_id, points_to_add;
END;
$$;
