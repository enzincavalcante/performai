import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export const useTreasuryManager = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const addTreasuryFundsMutation = useMutation({
    mutationFn: async ({
      teamId,
      amount,
      description,
      contributorUserId,
    }: {
      teamId: string;
      amount: number;
      description?: string;
      contributorUserId?: string;
    }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      console.log("Пополнение казны:", {
        teamId,
        amount,
        description,
        contributorUserId,
      });

      const { error } = await supabase.from("treasury_transactions").insert({
        team_id: teamId,
        amount: amount,
        stage_name: "Пополнение казны",
        user_id: user.id,
        description: description,
      });

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ points: profile?.points - amount })
        .eq("id", user.id);

      const { data, error: getTeamError } = await supabase
        .from("teams")
        .select("treasury_balance")
        .eq("id", teamId)
        .single();

      const { error: teamError } = await supabase
        .from("teams")
        .update({
          treasury_balance: data.treasury_balance + amount,
        })
        .eq("id", teamId);
      if (error || profileError || getTeamError || teamError) {
        throw error || profileError || getTeamError || teamError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasury-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["team-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (error) => {
      console.error("Ошибка в addTreasuryFundsMutation:", error);
    },
  });

  return {
    addTreasuryFunds: addTreasuryFundsMutation.mutateAsync,
    isAdding: addTreasuryFundsMutation.isPending,
  };
};
