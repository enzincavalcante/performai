
-- Создаем таблицу для команд/отделов
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Создаем таблицу для участников команд
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Создаем таблицу для сообщений чата
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для новых таблиц
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики для команд
CREATE POLICY "Users can view teams they are members of" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Политики для участников команд
CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team leaders can add members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM public.teams t 
      WHERE t.created_by = auth.uid()
    )
  );

-- Политики для сообщений чата
CREATE POLICY "Users can view messages from their teams" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    ) OR team_id IS NULL
  );

CREATE POLICY "Users can send messages to their teams" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = auth.uid()
      ) OR team_id IS NULL
    )
  );

-- Добавляем поле team_id в профили пользователей (если его еще нет)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'team_id' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN team_id UUID REFERENCES public.teams(id);
    END IF;
END $$;

-- Функция для получения рейтинга команд
CREATE OR REPLACE FUNCTION public.get_team_rankings()
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  total_points BIGINT,
  member_count BIGINT,
  avg_points NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    t.id as team_id,
    t.name as team_name,
    COALESCE(SUM(p.points), 0) as total_points,
    COUNT(tm.user_id) as member_count,
    CASE 
      WHEN COUNT(tm.user_id) > 0 THEN ROUND(COALESCE(SUM(p.points), 0)::numeric / COUNT(tm.user_id), 2)
      ELSE 0
    END as avg_points
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.profiles p ON tm.user_id = p.id
  GROUP BY t.id, t.name
  ORDER BY total_points DESC;
$$;
