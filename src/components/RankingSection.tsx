import React from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRanking } from "@/hooks/useRanking";
import { useTeams } from "@/hooks/useTeams";
import { Skeleton } from "@/components/ui/skeleton";

export const RankingSection = () => {
  const { rankings, isLoading } = useRanking();
  const { teamRankings, rankingsLoading } = useTeams();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="vice-card p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border border-cyan-400/30 rounded-lg bg-gray-800/50"
              >
                <Skeleton className="w-12 h-12 rounded-full bg-cyan-400/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48 bg-pink-500/20" />
                  <Skeleton className="h-4 w-32 bg-purple-400/20" />
                </div>
                <Skeleton className="h-8 w-20 bg-green-400/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Топ-3 игроков в Vice City стиле */}
      <div className="vice-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 border-2 border-pink-500/30 rounded-lg pointer-events-none"></div>

        <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-8 text-center neon-text">
          ТОП ИГРОКИ НЕДЕЛИ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rankings.slice(0, 3).map((player, index) => (
            <Link key={player.id} to={`/player/${player.id}`}>
              <div className="vice-card p-6 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 vice-gradient opacity-10 group-hover:opacity-20 transition-opacity"></div>

                {/* Позиция и корона */}
                <div className="relative z-10 mb-4">
                  {index === 0 && (
                    <Trophy className="mx-auto text-yellow-400 w-12 h-12 mb-2 animate-bounce" />
                  )}
                  {index === 1 && (
                    <Medal className="mx-auto text-gray-300 w-12 h-12 mb-2" />
                  )}
                  {index === 2 && (
                    <Award className="mx-auto text-orange-400 w-12 h-12 mb-2" />
                  )}

                  <div
                    className={`text-6xl font-bold font-mono mb-2 ${
                      index === 0
                        ? "text-yellow-400 neon-text"
                        : index === 1
                        ? "text-gray-300"
                        : "text-orange-400"
                    }`}
                  >
                    #{player.rank}
                  </div>
                </div>

                {/* Аватар */}
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 border-2 ${
                    index === 0
                      ? "border-yellow-400 vice-gradient"
                      : index === 1
                      ? "border-gray-300 bg-gradient-to-br from-gray-600 to-gray-800"
                      : "border-orange-400 bg-gradient-to-br from-orange-600 to-orange-800"
                  } shadow-lg`}
                >
                  {player.avatar}
                </div>

                {/* Информация об игроке */}
                <h3 className="text-xl font-bold font-mono text-white mb-2 tracking-wide">
                  {player.full_name || player.username}
                </h3>
                <p className="text-cyan-300 font-mono text-sm mb-3">
                  {player.rank_title}
                </p>
                <p className="text-3xl font-bold font-mono text-green-400 neon-text">
                  ${player.points.toLocaleString()}
                </p>
                <p className="text-cyan-400 font-mono text-sm mt-2">
                  {player.stages} сделок
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Полный рейтинг игроков */}
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>

        <h3 className="text-2xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
          <Trophy className="mr-3 text-cyan-400 w-8 h-8" />
          ПОЛНЫЙ РЕЙТИНГ ИГРОКОВ
        </h3>

        <div className="space-y-3">
          {rankings.map((player) => (
            <Link key={player.id} to={`/player/${player.id}`}>
              <div
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer ${
                  player.isCurrentUser
                    ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-500/20 shadow-lg shadow-pink-500/25"
                    : "border-cyan-400/30 bg-gray-800/50 hover:bg-gray-700/50"
                }`}
              >
                {/* Ранг и тренд */}
                <div className="flex items-center space-x-3 w-20">
                  <div
                    className={`text-2xl font-bold font-mono ${
                      player.rank <= 3
                        ? "text-yellow-400 neon-text"
                        : "text-cyan-300"
                    }`}
                  >
                    #{player.rank}
                  </div>
                  <div className="text-gray-400">
                    {player.trend === "up" && (
                      <TrendingUp size={16} className="text-green-400" />
                    )}
                    {player.trend === "down" && (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                    {player.trend === "same" && (
                      <Minus size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Аватар */}
                <div className="w-14 h-14 vice-gradient rounded-full flex items-center justify-center text-2xl border-2 border-cyan-400 shadow-lg">
                  {player.avatar}
                </div>

                {/* Информация об игроке */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold font-mono text-white text-lg">
                      {player.full_name || player.username}
                    </h4>
                    {player.isCurrentUser && (
                      <span className="px-2 py-1 text-xs font-mono font-bold bg-pink-500 text-white rounded neon-glow">
                        ВЫ
                      </span>
                    )}
                  </div>
                  <p className="text-cyan-300 font-mono text-sm">
                    {player.rank_title}
                  </p>
                </div>

                {/* Статистика */}
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-green-400 neon-text mb-1">
                    ${player.points.toLocaleString()}
                  </div>
                  <div className="text-sm text-cyan-400 font-mono">
                    {player.stages} сделок
                  </div>
                </div>

                {/* Индикатор текущего пользователя */}
                {player.isCurrentUser && (
                  <User className="text-pink-400 w-6 h-6" />
                )}
              </div>
            </Link>
          ))}
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-cyan-300 font-mono text-xl tracking-wider">
              РЕЙТИНГ ПУСТ
            </p>
            <p className="text-gray-400 font-mono text-sm mt-2">
              СТАНЬТЕ ПЕРВЫМ ИГРОКОМ!
            </p>
          </div>
        )}
      </div>

      {/* Рейтинг организаций */}
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-green-500/30 rounded-lg pointer-events-none"></div>

        <h3 className="text-2xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
          <DollarSign className="mr-3 text-green-400 w-8 h-8" />
          РЕЙТИНГ ОРГАНИЗАЦИЙ
        </h3>

        {rankingsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border border-green-400/30 rounded-lg bg-gray-800/50"
              >
                <Skeleton className="w-12 h-12 rounded-full bg-green-400/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48 bg-green-500/20" />
                  <Skeleton className="h-4 w-32 bg-emerald-400/20" />
                </div>
                <Skeleton className="h-8 w-20 bg-green-400/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {teamRankings.map((team, index) => (
              <Link key={team.team_id} to={`/team/${team.team_id}`}>
                <div className="flex items-center space-x-4 p-4 rounded-lg border border-green-400/30 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer">
                  {/* Позиция */}
                  <div
                    className={`text-2xl font-bold font-mono w-20 ${
                      index < 3 ? "text-yellow-400 neon-text" : "text-green-300"
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Иконка команды */}
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl border-2 border-green-400 shadow-lg">
                    🏢
                  </div>

                  {/* Информация о команде */}
                  <div className="flex-1">
                    <h4 className="font-bold font-mono text-white text-lg mb-1">
                      {team.team_name}
                    </h4>
                    <p className="text-green-300 font-mono text-sm">
                      {team.member_count} участников • Средний: $
                      {team.avg_points.toLocaleString()}
                    </p>
                  </div>

                  {/* Статистика */}
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-green-400 neon-text mb-1">
                      ${team.total_points.toLocaleString()}
                    </div>
                    <div className="text-sm text-emerald-400 font-mono">
                      Казна: ${team.treasury_balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {teamRankings.length === 0 && !rankingsLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-green-300 font-mono text-xl tracking-wider">
              НЕТ ОРГАНИЗАЦИЙ
            </p>
            <p className="text-gray-400 font-mono text-sm mt-2">
              СОЗДАЙТЕ ПЕРВУЮ ОРГАНИЗАЦИЮ!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
