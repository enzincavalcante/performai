
-- Создаем функцию для проверки членства в команде
CREATE OR REPLACE FUNCTION public.is_user_team_member(team_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_id_param AND user_id = auth.uid()
  );
$$;

-- Обновляем политики для таблицы teams
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

-- Создаем новую политику для создания команд
CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Обновляем политику для добавления участников команды
DROP POLICY IF EXISTS "Team creators can add members" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON public.team_members;

-- Создаем новую политику для добавления участников
CREATE POLICY "Team creators can add members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Создатель команды может добавлять участников
      EXISTS (
        SELECT 1 FROM public.teams 
        WHERE id = team_id AND created_by = auth.uid()
      ) OR 
      -- Пользователь может добавить себя в команду
      auth.uid() = user_id
    )
  );

-- Обновляем политику для просмотра участников команды
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND
    public.is_user_team_member(team_id)
  );
