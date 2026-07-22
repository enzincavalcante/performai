
-- Включаем RLS для таблицы этапов (если не включено)
ALTER TABLE public.player_stages ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики если есть
DROP POLICY IF EXISTS "Team members can view stages" ON public.player_stages;
DROP POLICY IF EXISTS "Team leaders can manage stages" ON public.player_stages;

-- Политика для просмотра этапов (участники команды могут видеть этапы своих товарищей)
CREATE POLICY "Team members can view stages" 
  ON public.player_stages 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Политика для добавления этапов (только руководители и админы команды)
CREATE POLICY "Team leaders can manage stages" 
  ON public.player_stages 
  FOR INSERT 
  WITH CHECK (
    added_by = auth.uid() AND
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('leader', 'admin')
    )
  );

-- Политика для удаления этапов (только руководители и админы команды)
CREATE POLICY "Team leaders can delete stages" 
  ON public.player_stages 
  FOR DELETE 
  USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('leader', 'admin')
    )
  );
