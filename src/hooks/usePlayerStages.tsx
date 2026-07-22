import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

interface PlayerStage {
  id: string;
  user_id: string;
  stage_name: string;
  points: number;
  added_by: string;
  team_id: string;
  created_at: string;
  description: string | null;
  verified: boolean;
}

export const usePlayerStages = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stages, isLoading } = useQuery({
    queryKey: ["player-stages", userId || user?.id],
    queryFn: async (): Promise<PlayerStage[]> => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("player_stages")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки этапов:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!(userId || user?.id),
  });

  const addStageMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      stageName,
      points,
      description,
      teamId,
      verified,
    }: {
      targetUserId: string;
      stageName: string;
      points: number;
      description?: string;
      teamId: string;
      verified: boolean;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      console.log("Добавление этапа:", {
        targetUserId,
        stageName,
        points,
        description,
      });
      const { error } = await supabase.from("player_stages").insert({
        added_by: user.id,
        user_id: targetUserId,
        stage_name: stageName,
        description: description || null,
        points: points,
        team_id: teamId,
        verified,
      });

      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", targetUserId)
        .single();
      const { error: transactionError } = await supabase
        .from("profiles")
        .update({
          points: profile?.points + points,
        })
        .eq("id", targetUserId);

      // const { error } = await supabase.rpc("manage_user_points_by_leader", {
      //   target_user_id: targetUserId,
      //   points_to_add: points,
      //   transaction_type_param: "этап",
      //   description_param: description || null,
      //   stage_name_param: stageName,
      // });

      if (error) {
        console.error("Ошибка добавления этапа:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stages"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error) => {
      console.error("Ошибка в addStageMutation:", error);
    },
  });

  const removeStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      console.log("Удаление этапа:", stageId);
      const { data } = await supabase
        .from("player_stages")
        .select("*")
        .eq("id", stageId)
        .single();
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", data?.user_id)
        .single();
      const { error: transactionError } = await supabase
        .from("profiles")
        .update({
          points: profile?.points - data?.points,
        })
        .eq("id", data?.user_id);

      const { error } = await supabase
        .from("player_stages")
        .delete()
        .eq("id", stageId);

      if (error) {
        console.error("Ошибка удаления этапа:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stages"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error) => {
      console.error("Ошибка в removeStageMutation:", error);
    },
  });

  const addPointsMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      points,
      description,
    }: {
      targetUserId: string;
      points: number;
      description?: string;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      console.log("Добавление баллов:", { targetUserId, points, description });

      const { error } = await supabase.rpc("manage_user_points_by_leader", {
        target_user_id: targetUserId,
        points_to_add: -points,
        transaction_type_param: -points > 0 ? "бонус" : "штраф",
        description_param: description || null,
      });

      if (error) {
        console.error("Ошибка добавления баллов:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error) => {
      console.error("Ошибка в addPointsMutation:", error);
    },
  });

  const approveStage = useMutation({
    mutationFn: async ({
      stageId,
      userId,
    }: {
      stageId: string;
      userId: string;
    }) => {
      try {
        const { error } = await supabase
          .from("player_stages")
          .update({ verified: true })
          .eq("id", stageId);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            points:
              profileData?.points +
              stages.find((stage) => stage.id === stageId)?.points,
          })
          .eq("id", userId);
        if (error || profileError || profileUpdateError) {
          throw error || profileError || profileUpdateError;
        }

        toast({
          title: "УСПЕХ",
          description: `ЭТАП ПОДТВЕРЖДЕН`,
        });
      } catch (error: any) {
        console.error("Ошибка подтверждения этапа:", error);
        toast({
          title: "ОШИБКА",
          description: error?.message || "НЕ УДАЛОСЬ ПОДТВЕРДИТЬ ЭТАП",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-stages"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });

  return {
    stages: stages || [],
    isLoading,
    addStage: addStageMutation.mutateAsync,
    removeStage: removeStageMutation.mutateAsync,
    addPoints: addPointsMutation.mutateAsync,
    approveStage: approveStage.mutateAsync,
    isManaging:
      addStageMutation.isPending ||
      removeStageMutation.isPending ||
      addPointsMutation.isPending,
  };
};
