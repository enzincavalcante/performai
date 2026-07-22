import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useTeamInvitations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inviteToTeamMutation = useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => {
      console.log("Начинаем приглашение пользователя:", {
        teamId,
        userId,
        currentUser: user?.id,
      });

      if (!user?.id) {
        console.error("Пользователь не авторизован");
        throw new Error("Пользователь не авторизован");
      }

      // Проверяем, является ли текущий пользователь руководителем команды
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("created_by")
        .eq("id", teamId)
        .single();

      if (teamError) {
        console.error("Ошибка при получении информации о команде:", teamError);
        throw new Error("Ошибка при проверке команды");
      }

      if (team.created_by !== user.id) {
        console.error("Недостаточно прав для приглашения");
        throw new Error(
          "Только руководитель команды может приглашать участников"
        );
      }

      // Проверяем, не является ли пользователь уже участником
      const { data: existingMember, error: checkError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        console.error(
          "Ошибка при проверке существующего участника:",
          checkError
        );
        throw new Error("Ошибка при проверке участника");
      }

      if (existingMember) {
        console.log("Пользователь уже является участником команды");
        throw new Error("Пользователь уже является участником организации");
      }

      console.log("Добавляем пользователя в команду...");

      // Добавляем пользователя в команду
      const { error: insertError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          user_id: userId,
          role: "member",
        });
      const { error: cleanError } = await supabase
        .from("team_members")
        .delete()
        .neq("team_id", teamId)
        .eq("user_id", userId);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ team_id: teamId })
        .eq("id", userId);

      if (insertError || updateError || cleanError) {
        console.error(
          "Ошибка при добавлении пользователя в команду:",
          insertError || updateError || cleanError
        );
        throw insertError || updateError || cleanError;
      }

      console.log("Пользователь успешно добавлен в команду");
      return { success: true };
    },
    onSuccess: () => {
      console.log("Успешное приглашение, обновляем кэш...");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-rankings"] });
    },
    onError: (error) => {
      console.error("Ошибка в мутации приглашения:", error);
    },
  });

  return {
    inviteToTeam: inviteToTeamMutation.mutateAsync,
    isInviting: inviteToTeamMutation.isPending,
  };
};
