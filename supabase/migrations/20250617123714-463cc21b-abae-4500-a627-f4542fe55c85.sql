-- Создаем функцию для прямого пополнения казны организации
CREATE OR REPLACE FUNCTION public.add_treasury_funds(
  team_id_param uuid,
  amount_param decimal(10,2),
  description_param text DEFAULT NULL::text,
  contributor_user_id uuid DEFAULT NULL::uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  leader_team_id UUID;
  final_user_id UUID;
BEGIN
  -- Получаем team_id текущего пользователя (руководителя/админа)
  SELECT tm.team_id INTO leader_team_id
  FROM public.team_members tm
  WHERE tm.user_id = auth.uid();
  
  IF leader_team_id != team_id_param THEN
    RAISE EXCEPTION 'Можно пополнять казну только своей команды';
  END IF;
  
  IF amount_param <= 0 THEN
    RAISE EXCEPTION 'Сумма пополнения должна быть больше нуля';
  END IF;
  
  -- Определяем пользователя (либо указанный, либо текущий)
  IF contributor_user_id IS NOT NULL THEN
    -- Проверяем, что указанный пользователь состоит в команде
    IF NOT EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_id_param AND user_id = contributor_user_id
    ) THEN
      RAISE EXCEPTION 'Указанный пользователь не состоит в команде';
    END IF;
    final_user_id := contributor_user_id;
  ELSE
    final_user_id := auth.uid();
  END IF;
  
  -- Добавляем транзакцию в казну
  INSERT INTO public.treasury_transactions (team_id, user_id, stage_name, amount, description)
  VALUES (team_id_param, final_user_id, 'Прямое пополнение', amount_param, description_param);
  
  -- Обновляем баланс казны команды
  UPDATE public.teams 
  SET treasury_balance = treasury_balance + amount_param
  WHERE id = team_id_param;

  -- Вычитаем баллы из профиля пользователя
  UPDATE public.profiles
  SET points = points - amount_param
  WHERE id = auth.uid();

  -- Логируем успешное выполнение
  RAISE NOTICE 'Успешно пополнена казна команды %: $%', team_id_param, amount_param;
END;
$$;
