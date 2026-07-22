
-- Сначала удаляем ВСЕ существующие политики для team_members
DROP POLICY IF EXISTS "Users can view own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team leaders can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can add members" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_self_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_leader_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON public.team_members;

-- Теперь создаем новые безопасные политики
CREATE POLICY "team_members_view_own" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "team_members_insert_own" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "team_members_leaders_manage" 
  ON public.team_members 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- Также исправим политики для teams если нужно
DROP POLICY IF EXISTS "Users can view all teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "teams_select_policy" ON public.teams;

CREATE POLICY "teams_view_all" 
  ON public.teams 
  FOR SELECT 
  USING (true);

CREATE POLICY "teams_insert_own" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
