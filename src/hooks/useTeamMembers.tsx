import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TeamMemberProfile {
  id: string;
  username: string;
  full_name: string | null;
  points: number;
  rank_title: string;
  total_deals: number;
  role?: string; // Add role property
}

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
  custom_rank: string | null;
  profiles: TeamMemberProfile | null;
}

export const useTeamMembers = (teamId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async (): Promise<TeamMember[]> => {
      console.log("Загружаем участников команды:", teamId);

      // Проверяем, является ли пользователь участником этой команды
      const { data: userMembership, error: membershipError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (membershipError) {
        console.error("Ошибка проверки участия в команде:", membershipError);
        throw membershipError;
      }

      // if (!userMembership) {
      //   console.log('Пользователь не является участником этой команды');
      //   return [];
      // }

      // Получаем всех участников команды
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("id, role, joined_at, user_id, custom_rank")
        .eq("team_id", teamId);

      if (membersError) {
        console.error("Ошибка загрузки участников команды:", membersError);
        throw membersError;
      }

      console.log("Участники команды найдены:", members?.length || 0);

      if (!members || members.length === 0) {
        return [];
      }

      // Получаем профили для всех участников, включая роль
      const userIds = members.map((member) => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, points, rank_title, total_deals, role, crystalls"
        )
        .in("id", userIds);

      const { data: stagesData } = await supabase
        .from("player_stages")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Ошибка загрузки профилей:", profilesError);
        throw profilesError;
      }

      console.log("Профили найдены:", profiles?.length || 0);

      // Объединяем данные
      const result = members.map((member) => ({
        ...member,
        profiles:
          profiles?.find((profile) => profile.id === member.user_id) || null,
        stages: stagesData?.filter((stage) => stage.user_id === member.user_id)
          .length,
      }));

      console.log("Итоговые данные участников:", result);
      return result;
    },
    enabled: !!teamId && !!user?.id,
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      // Проверяем, является ли текущий пользователь руководителем команды
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("created_by")
        .eq("id", teamId)
        .single();

      if (teamError) throw teamError;

      if (team.created_by !== user.id) {
        throw new Error("Только руководитель команды может удалять участников");
      }

      // Удаляем участника
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      const { error: error2 } = await supabase
        .from("profiles")
        .update({ team_id: null })
        .eq("id", memberId);

      if (error || error2) throw error || error2;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-rankings"] });
    },
  });

  return {
    teamMembers: teamMembers || [],
    isLoading,
    removeTeamMember: removeTeamMemberMutation.mutateAsync,
    isRemoving: removeTeamMemberMutation.isPending,
  };
};
