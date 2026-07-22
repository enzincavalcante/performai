import React from "react";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useTreasury } from "@/hooks/useTreasury";
import { Skeleton } from "@/components/ui/skeleton";

interface TreasuryHistoryProps {
  teamId: string;
  canView: boolean;
}

export const TreasuryHistory = ({ teamId, canView }: TreasuryHistoryProps) => {
  const { treasuryTransactions, isLoading } = useTreasury(teamId);

  if (!canView) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="vice-card p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 bg-cyan-400/20" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-4 border border-cyan-400/30 rounded-lg bg-gray-800/50"
            >
              <Skeleton className="w-12 h-12 rounded-full bg-green-400/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-pink-500/20" />
                <Skeleton className="h-3 w-48 bg-purple-400/20" />
              </div>
              <Skeleton className="h-6 w-20 bg-green-400/20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="vice-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 border border-green-500/30 rounded-lg pointer-events-none"></div>

      <h3 className="text-2xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
        <DollarSign className="mr-3 text-green-400 w-8 h-8" />
        ИСТОРИЯ КАЗНЫ
      </h3>

      {treasuryTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-green-300 font-mono text-xl tracking-wider">
            КАЗНА ПУСТА
          </p>
          <p className="text-gray-400 font-mono text-sm mt-2">
            ПОКА НЕТ ТРАНЗАКЦИЙ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {treasuryTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center space-x-4 p-4 rounded-lg border border-green-400/30 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300"
            >
              {/* Иконка */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>

              {/* Информация о транзакции */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-bold font-mono text-green-300 text-lg">
                    {transaction?.name}
                  </h4>
                </div>
                {transaction.description && (
                  <p className="text-gray-400 font-mono text-sm mb-1">
                    {transaction.description}
                  </p>
                )}
                <div className="flex items-center text-gray-500 text-xs font-mono">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(transaction.created_at).toLocaleDateString(
                    "ru-RU",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </div>

              {/* Сумма */}
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-green-400 neon-text">
                  +${transaction.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
