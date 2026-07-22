
-- Сначала отключаем RLS чтобы удалить все политики
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики для teams
DROP POLICY IF EXISTS "allow_team_select" ON public.teams;
DROP POLICY IF EXISTS "allow_team_insert" ON public.teams;
DROP POLICY IF EXISTS "teams_select_simple" ON public.teams;
DROP POLICY IF EXISTS "teams_insert_simple" ON public.teams;

-- Удаляем все политики для team_members
DROP POLICY IF EXISTS "allow_members_select" ON public.team_members;
DROP POLICY IF EXISTS "allow_members_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select_simple" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_simple" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can add themselves as members" ON public.team_members;

-- Включаем RLS обратно
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Создаем новые простые политики для teams
CREATE POLICY "allow_team_select" 
  ON public.teams 
  FOR SELECT 
  USING (true);

CREATE POLICY "allow_team_insert" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Создаем новые простые политики для team_members  
CREATE POLICY "allow_members_select" 
  ON public.team_members 
  FOR SELECT 
  USING (true);

CREATE POLICY "allow_members_insert" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
