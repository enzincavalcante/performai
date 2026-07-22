
-- Создаем функцию безопасности для проверки членства в команде
CREATE OR REPLACE FUNCTION public.is_team_member(team_id_param uuid, user_id_param uuid)
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

-- Удаляем проблематичные политики
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view messages from their teams" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their teams" ON public.chat_messages;

-- Создаем новые политики без рекурсии для team_members
CREATE POLICY "Users can view team members" 
  ON public.team_members 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Team creators can manage members" 
  ON public.team_members 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- Создаем простые политики для chat_messages
CREATE POLICY "Users can view all messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
