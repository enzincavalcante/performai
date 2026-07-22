import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSelfStages = ({ teamId }: { teamId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addSelfStageMutation = useMutation({
    mutationFn: async ({
      stageName,
      points,
      description,
      sharedWith,
      shareSum,
    }: {
      stageName: string;
      points: number;
      description?: string;
      sharedWith?: string;
      shareSum?: number;
    }) => {
      if (!user?.id) {
        console.error("Пользователь не авторизован");
        throw new Error("Пользователь не авторизован");
      }

      console.log(
        "useSelfStages: Начинаем добавление этапа для пользователя",
        user.id
      );
      console.log("useSelfStages: Параметры:", {
        stageName,
        points,
        description,
      });

      if (!!sharedWith?.length && !!shareSum) {
        const { error } = await supabase.from("player_stages").insert({
          user_id: sharedWith,
          stage_name: stageName,
          description: description || null,
          points: shareSum,
          team_id: teamId,
          verified: false,
          added_by: user.id,
        });
        const { error: error2 } = await supabase.from("player_stages").insert({
          user_id: user.id,
          stage_name: stageName,
          description: description || null,
          points: points - shareSum,
          team_id: teamId,
          verified: false,
          added_by: user.id,
        });

        if (error || error2) {
          console.error(
            "useSelfStages: Ошибка RPC вызова при добавлении этапа для пользователя",
            error,
            error2
          );
          throw error || error2;
        }
        return;
      }

      const { error } = await supabase.from("player_stages").insert({
        user_id: user.id,
        stage_name: stageName,
        description: description || null,
        points: points,
        team_id: teamId,
        verified: false,
        added_by: user.id,
      });

      if (error) {
        console.error("useSelfStages: Ошибка RPC вызова:", error);
        throw error;
      }

      console.log("useSelfStages: Этап успешно добавлен");
    },
    onSuccess: () => {
      console.log("useSelfStages: Обновляем кэш после успешного добавления");
      queryClient.invalidateQueries({ queryKey: ["player-stages"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["treasury-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["team-rankings"] });
    },
    onError: (error) => {
      console.error("useSelfStages: Ошибка в мутации:", error);
    },
  });

  return {
    addSelfStage: addSelfStageMutation.mutateAsync,
    isAdding: addSelfStageMutation.isPending,
  };
};
