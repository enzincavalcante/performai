
-- Обновляем функцию get_team_rankings чтобы избежать дублей
CREATE OR REPLACE FUNCTION public.get_team_rankings()
RETURNS TABLE(team_id uuid, team_name text, total_points bigint, member_count bigint, avg_points numeric)
LANGUAGE sql
STABLE
AS $function$
  SELECT DISTINCT
    t.id as team_id,
    t.name as team_name,
    COALESCE(SUM(p.points), 0) as total_points,
    COUNT(DISTINCT tm.user_id) as member_count,
    CASE 
      WHEN COUNT(DISTINCT tm.user_id) > 0 THEN ROUND(COALESCE(SUM(p.points), 0)::numeric / COUNT(DISTINCT tm.user_id), 2)
      ELSE 0
    END as avg_points
  FROM public.teams t
  LEFT JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.profiles p ON tm.user_id = p.id
  GROUP BY t.id, t.name
  HAVING COUNT(DISTINCT tm.user_id) > 0  -- Показываем только команды с участниками
  ORDER BY total_points DESC;
$function$
