
-- Удаляем старые политики для teams
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

-- Удаляем старые политики для team_members
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON public.team_members;

-- Создаем безопасную функцию для проверки членства в команде
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

-- Новые политики для teams без рекурсии
CREATE POLICY "Users can view teams they are members of" 
  ON public.teams 
  FOR SELECT 
  USING (public.is_user_team_member(id));

CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Новые политики для team_members
CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (public.is_user_team_member(team_id));

CREATE POLICY "Users can insert themselves as team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Политика для лидеров команд добавлять участников
CREATE POLICY "Team creators can add members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND created_by = auth.uid()
    )
  );
