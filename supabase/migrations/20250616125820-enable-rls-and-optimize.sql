
-- Включаем RLS для таблиц
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Удаляем политики если они существуют, затем создаем заново
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;

-- Добавляем политики для teams
CREATE POLICY "Users can view teams they are members of" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Добавляем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_chat_messages_team_id ON public.chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
