
-- Сначала проверим и исправим политики для таблицы teams
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

-- Политика для просмотра команд (участники могут видеть свои команды)
CREATE POLICY "Users can view teams they are members of" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Политика для создания команд (любой авторизованный пользователь может создать команду)
CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Теперь исправим политики для team_members
DROP POLICY IF EXISTS "Team leaders can add members" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can add members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;

-- Политика для просмотра участников команды
CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Политика для добавления участников команды
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
