import React, { useState } from "react";
import {
  Users,
  Crown,
  UserMinus,
  Calendar,
  UserPlus,
  Edit3,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TeamInviteDialog } from "./TeamInviteDialog";
import { TeamMemberManagement } from "./TeamMemberManagement";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TeamMemberStages } from "./TeamMemberStages";

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
  custom_rank: string | null;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    points: number;
    rank_title: string;
    total_deals: number;
  } | null;
}

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  isTeamLeader: boolean;
  isTeamAdmin: boolean;
  teamId: string;
  teamName: string;
  onRemoveMember: (memberId: string, memberName: string) => void;
  isRemoving: boolean;
}

export const TeamMembersTable = ({
  teamMembers,
  isLoading,
  isTeamLeader,
  isTeamAdmin,
  teamId,
  teamName,
  onRemoveMember,
  isRemoving,
}: TeamMembersTableProps) => {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [customRank, setCustomRank] = useState("");
  const [newCrystalls, setNewCrystalls] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canManage = isTeamLeader || isTeamAdmin;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const updateMemberRank = async (memberId: string, rank: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ custom_rank: rank })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "УСПЕХ",
        description: "РАНГ УЧАСТНИКА ОБНОВЛЕН",
      });

      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      setEditingMember(null);
      setCustomRank("");
    } catch (error) {
      console.error("Ошибка обновления ранга:", error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ОБНОВИТЬ РАНГ",
        variant: "destructive",
      });
    }
  };

  const updateUserCrystalls = async (memberId: string, crystals: number) => {
    try {
      const { error, data, status, statusText } = await supabase
        .from("profiles")
        .update({ crystalls: crystals })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "УСПЕХ",
        description: "КРИСТАЛЛЫ УЧАСТНИКА ОБНОВЛЕНЫ",
      });

      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      setEditingMember(null);
      setNewCrystalls(0);
    } catch (error) {
      console.error("Ошибка обновления кристаллов:", error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ОБНОВИТЬ КРИСТАЛЛЫ",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "УСПЕХ",
        description: `РОЛЬ УЧАСТНИКА ИЗМЕНЕНА НА ${
          role === "admin" ? "АДМИНИСТРАТОР" : "УЧАСТНИК"
        }`,
      });

      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ИЗМЕНИТЬ РОЛЬ",
        variant: "destructive",
      });
    }
  };

  const renderMember = (member: TeamMember) => {
    console.log(member);
    if (!member) {
      return null;
    }
    return (
      <>
        <tr
          key={member.id}
          className="border-b border-gray-600/50 hover:bg-pink-500/20 transition-all duration-300"
        >
          <td className="py-4 px-4">
            <Link
              to={`/player/${member.user_id}`}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-14 h-14 vice-gradient rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg">
                <span className="text-xl font-mono font-bold text-white filter drop-shadow-sm">
                  {member.profiles?.full_name?.[0] ||
                    member.profiles?.username?.[0] ||
                    "?"}
                </span>
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-50 animate-pulse"></div>
              </div>
              <div>
                <div className="font-bold font-mono text-white text-lg">
                  {member.profiles?.full_name ||
                    member.profiles?.username ||
                    "НЕИЗВЕСТНО"}
                </div>
                <div className="text-sm text-cyan-300 font-mono">
                  @{member.profiles?.username || "unknown"}
                </div>
              </div>
            </Link>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center space-x-2">
              {member.role === "leader" && (
                <div className="relative">
                  <Crown className="h-6 w-6 text-yellow-400 filter drop-shadow-lg" />
                  <div className="absolute inset-0 h-6 w-6 text-yellow-400 opacity-50 animate-pulse">
                    <Crown className="h-6 w-6" />
                  </div>
                </div>
              )}
              <span
                className={`px-4 py-2 rounded-lg font-mono font-bold text-sm tracking-wider border-2 shadow-lg ${
                  member.role === "leader"
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-yellow-300"
                    : member.role === "admin"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-300"
                }`}
              >
                {member.role === "leader"
                  ? "РУКОВОДИТЕЛЬ"
                  : member.role === "admin"
                  ? "АДМИНИСТРАТОР"
                  : "УЧАСТНИК"}
              </span>
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-purple-400 text-lg filter drop-shadow-sm">
                {member.custom_rank || member.profiles?.rank_title || "СТАЖЕР"}
              </span>
              {canManage && member.role !== "leader" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 text-xs bg-purple-600/20 border-purple-400/50 text-purple-300 hover:bg-purple-600/40"
                      onClick={() => {
                        setEditingMember(member.id);
                        setCustomRank(member.custom_rank || "");
                      }}
                    >
                      <Edit3 size={12} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="vice-card border border-purple-500/50">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                        РЕДАКТИРОВАТЬ РАНГ
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={customRank}
                        onChange={(e) => setCustomRank(e.target.value)}
                        placeholder="Введите кастомный ранг"
                        className="bg-gray-800 border border-purple-500/30 text-cyan-300 font-mono focus:border-purple-500 focus:ring-purple-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() =>
                            updateMemberRank(member.id, customRank)
                          }
                          className="bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-400 font-mono font-bold"
                        >
                          СОХРАНИТЬ
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </td>
          <td className="py-4 px-4">
            {member.role !== "leader" && (
              <span className="font-bold font-mono text-3xl text-green-400 filter drop-shadow-lg">
                ${member.profiles?.points?.toLocaleString() || 0}
              </span>
            )}
          </td>
          <td className="py-4 px-4">
            {member.role !== "leader" && (
              <span className="font-mono font-bold text-cyan-400 text-xl">
                {member?.stages || 0}
              </span>
            )}
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300 font-mono">
              <Calendar className="h-5 w-5 text-pink-400" />
              <span>{formatDate(member.joined_at)}</span>
            </div>
          </td>
          {canManage && (
            <td className="py-4 px-4">
              {member.role !== "leader" && (
                <div className="space-y-2">
                  {/* Управление участником */}
                  <TeamMemberManagement
                    member={member}
                    isLeader={isTeamLeader}
                    isAdmin={isTeamAdmin}
                    teamId={teamId}
                  />

                  {/* Управление ролью */}
                  <div className="flex space-x-2">
                    {isTeamLeader && member.role !== "admin" && (
                      <button
                        onClick={() => updateMemberRole(member.id, "admin")}
                        className="bg-gradient-to-r from-purple-600 to-purple-800 border-2 border-purple-400 text-white py-1 px-2 rounded-lg font-mono font-bold text-xs tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-1"
                      >
                        <ChevronUp size={12} />
                        <span>ПОВЫСИТЬ</span>
                      </button>
                    )}
                    {isTeamLeader && member.role === "admin" && (
                      <button
                        onClick={() => updateMemberRole(member.id, "member")}
                        className="bg-gradient-to-r from-orange-600 to-orange-800 border-2 border-orange-400 text-white py-1 px-2 rounded-lg font-mono font-bold text-xs tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 flex items-center space-x-1"
                      >
                        <ChevronDown size={12} />
                        <span>ПОНИЗИТЬ</span>
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onRemoveMember(
                          member.id,
                          member.profiles?.full_name ||
                            member.profiles?.username ||
                            "Участник"
                        )
                      }
                      disabled={isRemoving}
                      className="bg-gradient-to-r from-red-600 to-red-800 border-2 border-red-400 text-white py-1 px-2 rounded-lg font-mono font-bold text-xs tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center space-x-1"
                    >
                      <UserMinus size={12} className="filter drop-shadow-sm" />
                      <span>ИСКЛЮЧИТЬ</span>
                    </button>
                  </div>
                </div>
              )}
            </td>
          )}

          <td className="py-4 px-4">
            <div className="flex items-center space-x-2 nowrap w-full gap-2">
            {member.role !== 'leader' && 
                <span className="font-bold font-mono text-2xl text-cyan-400 filter drop-shadow-lg whitespace-nowrap">
                {member.profiles?.crystalls?.toLocaleString() || 0} 💎
              </span>
            }
              {canManage && member.role !== "leader" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 text-xs bg-purple-600/20 border-purple-400/50 text-purple-300 hover:bg-purple-600/40"
                      onClick={() => {
                        setNewCrystalls(member?.crystalls || 0);
                      }}
                    >
                      <Edit3 size={12} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="vice-card border border-purple-500/50">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                        ИЗМЕНИТЬ КРИСТАЛЛЫ 💎
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={String(newCrystalls)} // always show normalized value
                        onChange={(e) => {
                          let val = e.target.value;

                          // If empty -> 0
                          if (val === "") {
                            setNewCrystalls(0);
                            return;
                          }

                          // Remove all non-digits
                          val = val.replace(/\D/g, "");

                          // Remove leading zeros (but allow single "0")
                          val = val.replace(/^0+/, "");
                          if (val === "") val = "0";

                          setNewCrystalls(Number(val));
                        }}
                        placeholder="Введите новое количество кристаллов"
                        className="bg-gray-800 border border-purple-500/30 text-cyan-300 font-mono focus:border-purple-500 focus:ring-purple-500"
                        type="text" // keep text to fully control display
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() =>
                            updateUserCrystalls(
                              member?.profiles?.id,
                              newCrystalls
                            )
                          }
                          className="bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-400 font-mono font-bold"
                        >
                          СОХРАНИТЬ
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </td>
        </tr>

        <tr>
          <TeamMemberStages canManage={canManage} member={member} />
        </tr>
      </>
    );
  };

  const leader = teamMembers.find((el) => el.role === "leader");

  const renderMembers = () => {
    if (teamMembers.filter((el) => el.role !== "leader").length > 1) {
      return teamMembers
        .filter((el) => el.role !== "leader")
        .sort((a, b) => {
          return b.profiles?.points - a.profiles?.points;
        })
        .map((member) => renderMember(member));
    }

    return teamMembers
      .filter((el) => el.role !== "leader")
      .map((member) => renderMember(member));
  };

  return (
    <div className="vice-card p-8 relative border-2 border-pink-500/50 bg-gradient-to-br from-gray-900/90 to-purple-900/90">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
          <div className="relative mr-4">
            <Users className="text-cyan-400 w-10 h-10 filter drop-shadow-lg" />
            <div className="absolute inset-0 text-cyan-400 opacity-30 animate-pulse">
              <Users className="w-10 h-10" />
            </div>
          </div>
          УЧАСТНИКИ ОРГАНИЗАЦИИ
        </h2>
        {canManage && <TeamInviteDialog teamId={teamId} teamName={teamName} />}
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="vice-card p-6 border border-cyan-400/30 bg-gray-800/50"
              >
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-cyan-400/20" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 bg-pink-500/20" />
                    <Skeleton className="h-4 w-24 bg-purple-400/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-cyan-300 font-mono text-xl tracking-wider">
              В ОРГАНИЗАЦИИ ПОКА НЕТ УЧАСТНИКОВ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cyan-400/50">
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    УЧАСТНИК
                  </th>
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    РОЛЬ
                  </th>
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    РАНГ
                  </th>
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    ДОЛЛАРЫ
                  </th>
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    ЭТАПЫ
                  </th>
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    ДАТА ВСТУПЛЕНИЯ
                  </th>
                  {canManage && (
                    <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                      ДЕЙСТВИЯ
                    </th>
                  )}
                  <th className="text-left py-4 px-4 font-mono font-bold text-cyan-300 tracking-wider uppercase text-sm">
                    КРИСТАЛЛЫ
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderMember(leader)}
                {renderMembers()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
