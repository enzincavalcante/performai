
-- Удаляем ВСЕ политики для team_members
DO $$ 
DECLARE 
    policy_name TEXT;
BEGIN 
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'team_members' AND schemaname = 'public'
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.team_members';
    END LOOP;
END $$;

-- Удаляем ВСЕ политики для teams
DO $$ 
DECLARE 
    policy_name TEXT;
BEGIN 
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public'
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.teams';
    END LOOP;
END $$;

-- Создаем функции, которые используются в политиках
CREATE OR REPLACE FUNCTION public.is_team_member_check(team_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_id_param AND user_id = user_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_leader(team_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_id_param AND created_by = user_id_param
  );
$$;

-- Создаем новые политики для team_members
CREATE POLICY "team_members_select_policy" 
  ON public.team_members 
  FOR SELECT 
  USING (public.is_team_member_check(team_id, auth.uid()));

CREATE POLICY "team_members_insert_self_policy" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "team_members_insert_leader_policy" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (public.is_team_leader(team_id, auth.uid()));

CREATE POLICY "team_members_update_policy" 
  ON public.team_members 
  FOR UPDATE 
  USING (public.is_team_leader(team_id, auth.uid()));

CREATE POLICY "team_members_delete_policy" 
  ON public.team_members 
  FOR DELETE 
  USING (public.is_team_leader(team_id, auth.uid()));

-- Создаем новые политики для teams
CREATE POLICY "teams_select_policy" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "teams_insert_new_policy" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);
