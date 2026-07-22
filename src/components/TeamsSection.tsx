import React, { useState } from "react";
import { Users, Plus, Trophy, MessageCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { TeamInviteDialog } from "./TeamInviteDialog";
import { useProfile } from "@/hooks/useProfile";

export const TeamsSection = () => {
  const navigate = useNavigate();
  const {
    userTeams,
    teamRankings,
    teamsLoading,
    rankingsLoading,
    teamsError,
    rankingsError,
    createTeam,
    isCreatingTeam,
  } = useTeams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const { profile } = useProfile();
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== ОБРАБОТЧИК СОЗДАНИЯ КОМАНДЫ ===");
    console.log("Название команды:", teamName);
    console.log("Описание команды:", teamDescription);

    if (!teamName.trim()) {
      console.log("Ошибка: пустое название команды");
      toast.error("ОШИБКА: ВВЕДИТЕ НАЗВАНИЕ ОРГАНИЗАЦИИ");
      return;
    }

    try {
      console.log("Вызываем createTeam...");

      const result = await createTeam({
        name: teamName.trim(),
        description: teamDescription.trim() || undefined,
      });

      console.log("Результат создания команды:", result);

      setTeamName("");
      setTeamDescription("");
      setShowCreateDialog(false);

      toast.success("ОРГАНИЗАЦИЯ УСПЕШНО СОЗДАНА");
    } catch (error: any) {
      console.error("=== ОШИБКА СОЗДАНИЯ ОРГАНИЗАЦИИ ===");
      console.error("Тип ошибки:", typeof error);
      console.error("Ошибка:", error);
      console.error("Сообщение:", error?.message);
      console.error("Код:", error?.code);
      console.error("Детали:", error?.details);

      let errorMessage = "НЕ УДАЛОСЬ СОЗДАТЬ ОРГАНИЗАЦИЮ";

      if (error?.message) {
        if (
          error.message.includes("permission") ||
          error.message.includes("denied")
        ) {
          errorMessage = "НЕДОСТАТОЧНО ПРАВ ДЛЯ СОЗДАНИЯ ОРГАНИЗАЦИИ";
        } else if (
          error.message.includes("duplicate") ||
          error.message.includes("unique")
        ) {
          errorMessage = "ОРГАНИЗАЦИЯ С ТАКИМ НАЗВАНИЕМ УЖЕ СУЩЕСТВУЕТ";
        } else if (
          error.message.includes("авторизован") ||
          error.message.includes("auth")
        ) {
          errorMessage = "ОШИБКА АВТОРИЗАЦИИ. ПЕРЕЗАЙДИТЕ В СИСТЕМУ";
        } else {
          errorMessage = `ОШИБКА: ${error.message}`;
        }
      } else if (error?.code) {
        switch (error.code) {
          case "23505":
            errorMessage = "ОРГАНИЗАЦИЯ С ТАКИМ НАЗВАНИЕМ УЖЕ СУЩЕСТВУЕТ";
            break;
          case "42501":
          case "PGRST301":
            errorMessage = "НЕДОСТАТОЧНО ПРАВ ДЛЯ СОЗДАНИЯ ОРГАНИЗАЦИИ";
            break;
          case "PGRST116":
            errorMessage = "ОШИБКА АВТОРИЗАЦИИ. ПЕРЕЗАЙДИТЕ В СИСТЕМУ";
            break;
          default:
            errorMessage = `ОШИБКА БАЗЫ ДАННЫХ (КОД: ${error.code})`;
        }
      }

      console.error("Финальное сообщение об ошибке:", errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleTeamClick = (teamId: string) => {
    navigate(`/team/${teamId}`);
  };

  console.log(profile)

  return (
    <div className="space-y-8">
      {/* Заголовок в Vice City стиле */}
      {profile?.role === "leader" && (
        <div className="vice-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-lg pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 vice-gradient rounded-full flex items-center justify-center border-2 border-cyan-400 neon-glow">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient neon-text mb-2">
                  ОРГАНИЗАЦИИ
                </h2>
                <p className="text-cyan-300 font-mono text-lg tracking-wide">
                  УПРАВЛЕНИЕ ОРГАНИЗАЦИЯМИ И СОТРУДНИЧЕСТВО
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <button className="vice-button text-white py-4 px-8 rounded-lg font-mono font-bold text-lg tracking-wider transition-all duration-300 hover:scale-105 flex items-center space-x-3">
                  <Plus size={24} />
                  <span>СОЗДАТЬ ОРГАНИЗАЦИЮ</span>
                </button>
              </DialogTrigger>
              <DialogContent className="vice-card border border-pink-500/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                    СОЗДАТЬ НОВУЮ ОРГАНИЗАЦИЮ
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div>
                    <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
                      НАЗВАНИЕ ОРГАНИЗАЦИИ
                    </label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Введите название организации"
                      className="bg-gray-800 border border-pink-500/30 text-cyan-300 font-mono focus:border-pink-500 focus:ring-pink-500"
                      required
                      disabled={isCreatingTeam}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
                      ОПИСАНИЕ (НЕОБЯЗАТЕЛЬНО)
                    </label>
                    <Textarea
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Описание организации"
                      className="bg-gray-800 border border-pink-500/30 text-cyan-300 font-mono focus:border-pink-500 focus:ring-pink-500"
                      rows={3}
                      disabled={isCreatingTeam}
                      maxLength={200}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="border-purple-400 text-purple-400 font-mono tracking-wider hover:bg-purple-400/10"
                      disabled={isCreatingTeam}
                    >
                      ОТМЕНА
                    </Button>
                    <button
                      type="submit"
                      disabled={isCreatingTeam || !teamName.trim()}
                      className="vice-button text-white py-2 px-6 rounded font-mono font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingTeam ? "СОЗДАНИЕ..." : "СОЗДАТЬ"}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Мои организации в Vice City стиле */}
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>

        <h3 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center relative z-10">
          <Users className="mr-3 text-cyan-400 w-8 h-8" />
          МОИ ОРГАНИЗАЦИИ
        </h3>

        <div className="relative z-10">
          {teamsError ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-red-400 w-16 h-16 mb-4" />
              <p className="text-red-400 font-mono text-lg tracking-wider mb-2">
                ОШИБКА ЗАГРУЗКИ ОРГАНИЗАЦИЙ
              </p>
              <p className="text-cyan-300 font-mono text-sm">
                {teamsError.message}
              </p>
            </div>
          ) : teamsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="vice-card p-6 border border-pink-500/30 animate-pulse"
                >
                  <Skeleton className="h-6 w-32 mb-2 bg-pink-500/20" />
                  <Skeleton className="h-4 w-48 mb-3 bg-cyan-400/20" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20 bg-purple-400/20" />
                    <Skeleton className="h-8 w-16 bg-blue-400/20" />
                  </div>
                </div>
              ))}
            </div>
          ) : userTeams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-cyan-300 font-mono text-xl tracking-wider">
                ВЫ ПОКА НЕ СОСТОИТЕ НИ В ОДНОЙ ОРГАНИЗАЦИИ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userTeams.map((membership) => (
                <div
                  key={membership.id}
                  className="vice-card p-6 border border-pink-500/30 cursor-pointer hover:scale-105 transition-all duration-300 hover:neon-glow relative overflow-hidden group"
                  onClick={() => handleTeamClick(membership.teams?.id!)}
                >
                  <div className="absolute inset-0 vice-gradient opacity-5 group-hover:opacity-10 transition-opacity"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-2">
                      {membership.teams?.name}
                    </h4>
                    {membership.teams?.description && (
                      <p className="text-cyan-300 font-mono text-sm mb-4">
                        {membership.teams.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded font-mono font-bold text-xs tracking-wider ${
                          membership.role === "leader"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                            : membership.role === "admin"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        }`}
                      >
                        {membership.role === "leader"
                          ? "РУКОВОДИТЕЛЬ"
                          : membership.role === "admin"
                          ? "АДМИНИСТРАТОР"
                          : "УЧАСТНИК"}
                      </span>
                      <div
                        className="flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(membership.role === "leader" ||
                          membership.role === "admin") &&
                          membership.teams?.id && (
                            <TeamInviteDialog
                              teamId={membership.teams.id}
                              teamName={membership.teams.name}
                            />
                          )}
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400 text-white py-1 px-3 rounded font-mono font-bold text-xs tracking-wider transition-all duration-300 hover:scale-105 hover:neon-glow-blue flex items-center space-x-1">
                          <MessageCircle size={12} />
                          <span>ЧАТ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Рейтинг организаций в Vice City стиле */}
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-yellow-500/30 rounded-lg pointer-events-none"></div>

        <h3 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center relative z-10">
          <Trophy className="mr-3 text-yellow-400 w-8 h-8" />
          РЕЙТИНГ ОРГАНИЗАЦИЙ
        </h3>

        <div className="relative z-10">
          {rankingsError ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-red-400 w-16 h-16 mb-4" />
              <p className="text-red-400 font-mono text-lg tracking-wider mb-2">
                ОШИБКА ЗАГРУЗКИ РЕЙТИНГА
              </p>
              <p className="text-cyan-300 font-mono text-sm">
                {rankingsError.message}
              </p>
            </div>
          ) : rankingsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between vice-card p-6 border border-yellow-400/30 animate-pulse"
                >
                  <div className="flex items-center space-x-6">
                    <Skeleton className="w-12 h-12 rounded-full bg-yellow-400/20" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2 bg-cyan-400/20" />
                      <Skeleton className="h-4 w-24 bg-purple-400/20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-8 w-16 mb-1 bg-green-400/20" />
                    <Skeleton className="h-4 w-20 bg-blue-400/20" />
                  </div>
                </div>
              ))}
            </div>
          ) : teamRankings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-cyan-300 font-mono text-xl tracking-wider">
                ПОКА НЕТ ОРГАНИЗАЦИЙ ДЛЯ ОТОБРАЖЕНИЯ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamRankings.map((team, index) => (
                <div
                  key={team.team_id}
                  className="flex items-center justify-between vice-card p-6 border border-yellow-400/30 cursor-pointer hover:scale-105 transition-all duration-300 hover:neon-glow relative overflow-hidden group"
                  onClick={() => handleTeamClick(team.team_id)}
                >
                  <div className="absolute inset-0 vice-gradient opacity-5 group-hover:opacity-10 transition-opacity"></div>

                  <div className="flex items-center space-x-6 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold font-mono text-2xl text-black border-2 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-300 neon-glow"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-300 to-gray-500 border-gray-200"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-400 to-orange-600 border-orange-300"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                        {team.team_name}
                      </h4>
                      <p className="text-cyan-300 font-mono tracking-wide">
                        {team.member_count} УЧАСТНИКОВ
                      </p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="font-bold text-3xl font-mono text-green-400 neon-text">
                      ${team.total_points.toLocaleString()}
                    </div>
                    <div className="text-cyan-300 font-mono text-sm tracking-wider">
                      СРЕДНЕЕ: ${Math.round(team.avg_points).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
