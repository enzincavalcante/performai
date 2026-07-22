import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;
type TeamMember = Tables<"team_members">;

export const useTeams = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: userTeams,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ["user-teams", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log("Загружаем команды пользователя:", user.id);

      // Сначала получаем команды пользователя через team_members
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("id, role, joined_at, team_id, custom_rank")
        .eq("user_id", user.id);

      if (memberError) {
        console.error("Ошибка загрузки участия в командах:", memberError);
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        console.log("Пользователь не состоит ни в одной команде");
        return [];
      }

      // Получаем информацию о командах
      const teamIds = memberData.map((member) => member.team_id);
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name, description, created_at, created_by")
        .in("id", teamIds);

      if (teamsError) {
        console.error("Ошибка загрузки информации о командах:", teamsError);
        throw teamsError;
      }

      // Объединяем данные
      const result = memberData.map((member) => ({
        ...member,
        teams: teamsData?.find((team) => team.id === member.team_id) || null,
      }));

      console.log("Команды загружены:", result.length);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const {
    data: teamRankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useQuery({
    queryKey: ["team-rankings"],
    queryFn: async () => {
      console.log("Загружаем рейтинг команд...");

      const { data, error } = await supabase.rpc("get_team_rankings");
      console.log(JSON.stringify(data, null, 2));
      if (error) {
        console.error("Ошибка загрузки рейтинга команд:", error);
        throw error;
      }

      console.log("Рейтинг команд загружен:", data?.length || 0, data);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const createTeamMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      console.log("=== НАЧАЛО СОЗДАНИЯ КОМАНДЫ ===");
      console.log("Данные для создания:", { name, description });
      console.log("Текущий пользователь:", user?.id);

      if (!user?.id) {
        console.error("Пользователь не авторизован");
        throw new Error("Пользователь не авторизован");
      }

      // Проверяем текущую сессию
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !session.session) {
        console.error("Ошибка сессии:", sessionError);
        throw new Error("Ошибка авторизации");
      }
      console.log("Сессия активна");

      try {
        // Создаем команду
        console.log("Создаем команду в таблице teams...");
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: name.trim(),
            description: description?.trim() || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (teamError) {
          console.error("Ошибка создания команды:", teamError);
          console.error("Детали ошибки:", {
            code: teamError.code,
            message: teamError.message,
            details: teamError.details,
            hint: teamError.hint,
          });
          throw teamError;
        }

        if (!team) {
          console.error("Команда не была создана - нет данных");
          throw new Error("Команда не была создана");
        }

        console.log("Команда создана успешно:", team);

        // Добавляем создателя как участника команды
        console.log("Добавляем создателя как участника команды...");
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: team.id,
            user_id: user.id,
            role: "leader",
          });

        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ team_id: team.id })
          .eq("id", user.id);

        if (memberError) {
          console.error("Ошибка добавления участника:", memberError);
          console.error("Детали ошибки участника:", {
            code: memberError.code,
            message: memberError.message,
            details: memberError.details,
            hint: memberError.hint,
          });
          throw memberError;
        }

        console.log("Создатель добавлен как участник команды");
        console.log("=== КОМАНДА СОЗДАНА УСПЕШНО ===");
        return team;
      } catch (error) {
        console.error("Ошибка в процессе создания команды:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Команда успешно создана, обновляем кеш...", data);
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-rankings"] });
    },
    onError: (error) => {
      console.error("Ошибка в мутации создания команды:", error);
    },
  });

  return {
    userTeams: userTeams || [],
    teamRankings: teamRankings || [],
    teamsLoading,
    rankingsLoading,
    teamsError,
    rankingsError,
    createTeam: createTeamMutation.mutateAsync,
    isCreatingTeam: createTeamMutation.isPending,
  };
};
