import React from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTeams } from "@/hooks/useTeams";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { TeamProfileHeader } from "./TeamProfileHeader";
import { TeamStatsCards } from "./TeamStatsCards";
import { TeamMembersTable } from "./TeamMembersTable";
import { TeamNotificationSettings } from "./TeamNotificationSettings";
import { OrganizationForum } from "./OrganizationForum";
import { SelfStageManagerButton } from "./SelfStageManagerButton";
import { TreasuryManager } from "./TreasuryManager";
import { TreasuryHistory } from "./TreasuryHistory";

export const TeamProfile = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile } = useProfile();

  const { teamRankings } = useTeams();
  const { teamMembers, isLoading, removeTeamMember, isRemoving } =
    useTeamMembers(teamId!);

  // Находим данные команды из рейтинга
  const teamData = teamRankings.find((team) => team.team_id === teamId);

  // Определяем роль текущего пользователя
  const currentUserMembership = teamMembers.find(
    (member) => member.user_id === user?.id
  );
  const isTeamLeader = currentUserMembership?.role === "leader";
  const isTeamAdmin = currentUserMembership?.role === "admin";

  const canViewTreasury = isTeamLeader || isTeamAdmin;

  const isMember = !!currentUserMembership; // Участник организации

  // Определяем доступные этапы для роли пользователя
  const getAvailableStages = () => {
    const userRole = profile?.role;
    if (userRole === "manager") {
      return ["Залог", "Почтовые сборы"];
    } else if (userRole === "closer") {
      return ["Залог", "Почта", "Этап"];
    }
    return [];
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      window.confirm(
        `Вы уверены, что хотите исключить ${memberName} из организации?`
      )
    ) {
      try {
        await removeTeamMember({ memberId });
        toast({
          title: "УСПЕХ",
          description: `${memberName} ИСКЛЮЧЕН ИЗ ОРГАНИЗАЦИИ`,
        });
      } catch (error) {
        console.error("Ошибка удаления участника:", error);
        toast({
          title: "ОШИБКА",
          description:
            error instanceof Error
              ? error.message
              : "НЕ УДАЛОСЬ ИСКЛЮЧИТЬ УЧАСТНИКА",
          variant: "destructive",
        });
      }
    }
  };

  if (!teamId) {
    return <div>Организация не найдена</div>;
  }

  return (
    <div className="space-y-8">
      <TeamProfileHeader teamName={teamData?.team_name || ""} />

      <TeamStatsCards
        totalPoints={teamData?.total_points || 0}
        memberCount={teamData?.member_count || 0}
        avgPoints={teamData?.avg_points || 0}
        treasuryBalance={teamData?.treasury_balance || 0}
      />

      {/* Управление этапами и казной */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Кнопка для самостоятельного добавления этапов */}
        {isMember && !isTeamLeader && (
          <div className="vice-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                  МОИ ЭТАПЫ
                </h3>
                <p className="text-gray-400 font-mono text-sm">
                  Добавляйте свои достижения самостоятельно
                </p>
              </div>
              <SelfStageManagerButton
                teamMembers={teamMembers}
                teamId={teamId}
                availableStages={getAvailableStages()}
              />
            </div>
          </div>
        )}

        {isMember && (
          <div className="vice-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                  УПРАВЛЕНИЕ КАЗНОЙ
                </h3>
                <p className="text-gray-400 font-mono text-sm">
                  Пополнение казны организации
                </p>
              </div>
              <TreasuryManager teamId={teamId} canManage={true} />
            </div>
          </div>
        )}
      </div>

      <TeamMembersTable
        teamMembers={teamMembers}
        isLoading={isLoading}
        isTeamLeader={isTeamLeader}
        isTeamAdmin={isTeamAdmin}
        teamId={teamId}
        teamName={teamData?.team_name || ""}
        onRemoveMember={handleRemoveMember}
        isRemoving={isRemoving}
      />
      {isMember && <TreasuryHistory teamId={teamId} canView={isMember} />}

      <OrganizationForum
        teamId={teamId}
        canCreateTopics={isTeamLeader || isTeamAdmin}
      />
    </div>
  );
};
