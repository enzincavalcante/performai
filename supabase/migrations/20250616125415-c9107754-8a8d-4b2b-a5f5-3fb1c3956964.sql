
-- Удаляем проблематичные политики для team_members
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team leaders can add members" ON public.team_members;

-- Создаем исправленные политики для team_members
CREATE POLICY "Users can view team members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (auth.uid() = user_id OR team_id IN (
    SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid()
  ));

CREATE POLICY "Team leaders can add members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- Добавляем политики для chat_messages
DROP POLICY IF EXISTS "Users can view messages from their teams" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their teams" ON public.chat_messages;

CREATE POLICY "Users can view messages from their teams" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    team_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = chat_messages.team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their teams" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      team_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM public.team_members tm 
        WHERE tm.team_id = chat_messages.team_id AND tm.user_id = auth.uid()
      )
    )
  );
