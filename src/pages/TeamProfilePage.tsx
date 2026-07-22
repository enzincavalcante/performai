import React from "react";
import { TeamProfile } from "../components/TeamProfile";
import { ChatSection } from "../components/ChatSection";
import { TreasuryHistory } from "../components/TreasuryHistory";
import { useParams } from "react-router-dom";
import { useTeamMembers } from "../hooks/useTeamMembers";
import { useAuth } from "../hooks/useAuth";

const TeamProfilePage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers(teamId!);

  // Определяем роль текущего пользователя
  const currentUserMembership = teamMembers.find(
    (member) => member.user_id === user?.id
  );
  const isTeamLeader = currentUserMembership?.role === "leader";
  const isTeamAdmin = currentUserMembership?.role === "admin";
  const canViewTreasury = isTeamLeader || isTeamAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <TeamProfile />

        {teamId && <ChatSection teamId={teamId} title="Чат команды" />}
      </div>
    </div>
  );
};

export default TeamProfilePage;
