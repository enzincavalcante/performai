import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TreasuryTransaction {
  id: string;
  stage_name: string;
  amount: number;
  created_at: string;
  description: string | null;
  user_id: string;
}

export const useTreasury = (teamId: string) => {
  const { data: treasuryTransactions, isLoading } = useQuery({
    queryKey: ["treasury-transactions", teamId],
    queryFn: async (): Promise<TreasuryTransaction[]> => {
      console.log("Загружаем транзакции казны для команды:", teamId);
      const { data: transactions, error: transactionsError } = await supabase
        .from("treasury_transactions")
        .select("id, stage_name, amount, created_at, description, user_id")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      console.log(transactions, transactionsError);

      const userIds = [...new Set(transactions.map((tx) => tx.user_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const userMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile.full_name;
        return acc;
      }, {});

      const transactionsWithNames = transactions.map((tx) => ({
        ...tx,
        name: userMap[tx.user_id] || "Unknown",
      }));

      if (profilesError || transactionsError) {
        console.error(
          "Ошибка загрузки транзакций казны:",
          profilesError || transactionsError
        );
        throw profilesError || transactionsError;
      }

      console.log(
        "Транзакции казны загружены:",
        transactionsWithNames.length || 0
      );
      return transactionsWithNames || [];
    },
    enabled: !!teamId,
    staleTime: 60000, // Кешируем на 1 минуту
  });

  return {
    treasuryTransactions: treasuryTransactions || [],
    isLoading,
  };
};
