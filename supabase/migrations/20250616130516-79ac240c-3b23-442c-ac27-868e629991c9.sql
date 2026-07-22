

-- Добавляем политику, которая позволяет создателю команды добавлять себя как участника
CREATE POLICY "Team creators can add themselves as members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND created_by = auth.uid()
    )
  );

-- Также обновляем существующую политику для большей ясности
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON public.team_members;

