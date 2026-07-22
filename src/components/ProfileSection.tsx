import React, { useState } from "react";
import {
  User,
  Star,
  Target,
  Award,
  Users,
  Trophy,
  MessageCircle,
  UserPlus,
  Gem,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { usePlayerStages } from "@/hooks/usePlayerStages";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { ProfileActions } from "./ProfileActions";
import { useAuth } from "@/hooks/useAuth";

export const ProfileSection = () => {
  const { profile, isLoading, refreshProfile } = useProfile();
  const { stages } = usePlayerStages(profile?.id);
  const { user } = useAuth();
  const { teamRankings } = useTeams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMyProfile = profile?.id === user?.id;
  // Находим команду пользователя
  const userTeam = teamRankings.find(
    (team) => team.team_id === profile?.team_id
  );

  if (isLoading) {
    return (
      <div className="vice-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cyan-400/20 rounded w-1/3"></div>
          <div className="h-4 bg-pink-500/20 rounded w-1/2"></div>
          <div className="h-6 bg-purple-400/20 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="vice-card p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-cyan-300 font-mono text-xl tracking-wider">
          ПРОФИЛЬ НЕ НАЙДЕН
        </p>
      </div>
    );
  }

  // GTA стиль аватарки
  const avatars = [
    "👨‍💼",
    "👩‍💼",
    "🕴️",
    "👨‍🔧",
    "👩‍🔧",
    "👨‍🚀",
    "👩‍🚀",
    "👨‍💻",
    "👩‍💻",
    "🦹‍♂️",
    "🦹‍♀️",
    "🥷",
  ];

  return (
    <div className="space-y-8">
      {/* Основная информация профиля */}
      <div className="vice-card p-8 relative border-2 border-cyan-500/50 bg-gradient-to-br from-gray-900/90 to-blue-900/90">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg"></div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-6">
              <div className="relative w-20 h-20 vice-gradient rounded-full flex items-center justify-center border-4 border-cyan-400 shadow-lg">
                <span className="text-3xl font-mono font-bold text-white filter drop-shadow-lg">
                  {avatars[profile.avatar_id - 1] ||
                    profile.full_name?.[0] ||
                    profile.username?.[0] ||
                    "?"}
                </span>
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 opacity-50 animate-pulse"></div>
              </div>

              <div>
                <h1 className="text-4xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-cyan-300 font-mono text-lg">
                  @{profile.username}
                </p>

                {/* Организация */}
                {userTeam ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <Link
                      to={`/team/${profile.team_id}`}
                      className="text-purple-400 hover:text-purple-300 font-mono font-bold transition-colors"
                    >
                      {userTeam.team_name}
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-400 font-mono text-sm mt-2">
                    НЕ СОСТОИТ В ОРГАНИЗАЦИИ
                  </p>
                )}
              </div>
            </div>

            {isMyProfile && (
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="vice-button font-mono tracking-wider"
              >
                РЕДАКТИРОВАТЬ
              </Button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Баллы */}
            <div className="vice-card p-6 border border-green-500/30 bg-green-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Target className="text-green-400 w-10 h-10 filter drop-shadow-lg" />
                  <div className="absolute inset-0 text-green-400 opacity-30 animate-pulse">
                    <Target className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-green-400 filter drop-shadow-lg">
                    ${profile.points.toLocaleString()}
                  </div>
                  <div className="text-sm font-mono text-green-300 tracking-wider uppercase">
                    ДОЛЛАРЫ
                  </div>
                </div>
              </div>
            </div>

            {/* Ранг */}
            <div className="vice-card p-6 border border-purple-500/30 bg-purple-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Star className="text-purple-400 w-10 h-10 filter drop-shadow-lg" />
                  <div className="absolute inset-0 text-purple-400 opacity-30 animate-pulse">
                    <Star className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-purple-400 filter drop-shadow-sm">
                    {profile.rank_title}
                  </div>
                  <div className="text-sm font-mono text-purple-300 tracking-wider uppercase">
                    РАНГ
                  </div>
                </div>
              </div>
            </div>

            {/* Сделки */}
            {/* <div className="vice-card p-6 border border-pink-500/30 bg-pink-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Award className="text-pink-400 w-10 h-10 filter drop-shadow-lg" />
                  <div className="absolute inset-0 text-pink-400 opacity-30 animate-pulse">
                    <Award className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-pink-400 filter drop-shadow-lg">
                    {profile.total_deals}
                  </div>
                  <div className="text-sm font-mono text-pink-300 tracking-wider uppercase">
                    СДЕЛКИ
                  </div>
                </div>
              </div>
            </div> */}

            {/* Этапы */}
            <div className="vice-card p-6 border border-cyan-500/30 bg-cyan-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Trophy className="text-cyan-400 w-10 h-10 filter drop-shadow-lg" />
                  <div className="absolute inset-0 text-cyan-400 opacity-30 animate-pulse">
                    <Trophy className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-cyan-400 filter drop-shadow-lg">
                    {stages.length}
                  </div>
                  <div className="text-sm font-mono text-cyan-300 tracking-wider uppercase">
                    ЭТАПЫ
                  </div>
                </div>
              </div>
            </div>
             <div className="vice-card p-6 border border-cyan-500/30 bg-cyan-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Gem className="text-cyan-400 w-10 h-10 filter drop-shadow-lg" />
                  <div className="absolute inset-0 text-cyan-400 opacity-30 animate-pulse">
                    <Gem className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-cyan-400 filter drop-shadow-lg">
                    {profile?.crystalls?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm font-mono text-cyan-300 tracking-wider uppercase">
                    КРИСТАЛЛЫ
                  </div>
                </div>
              </div>
            </div>
          </div>

      
          {/* Последние этапы */}
          {stages.length > 0 && (
            <div className="vice-card p-6 border border-cyan-500/30 bg-cyan-500/10">
              <h3 className="text-xl font-bold font-mono tracking-wider text-cyan-400 mb-4 flex items-center">
                <Trophy className="mr-2" />
                ПОСЛЕДНИЕ ЭТАПЫ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stages.slice(0, 6).map((stage) => (
                  <div
                    key={stage.id}
                    className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-cyan-300 font-bold">
                        {stage.stage_name}
                      </span>
                      <span className="font-mono text-green-400 font-bold">
                        +{stage.points}
                      </span>
                    </div>
                    {stage.description && (
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {stage.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {new Date(stage.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information about points management */}
          {/* <div className="flex justify-center">
            <div className="text-center">
              <p className="text-cyan-300 font-mono text-sm ">
                ЭТАПЫ МОЖНО ДОБАВИТЬ ВНУТРИ ОРГАНИЗАЦИИ
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Profile Actions - друзья и сообщения */}
      {isMyProfile && <ProfileActions />}

      {/* Profile Edit Dialog */}
      <ProfileEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profile={profile}
        onProfileUpdate={() => {
          refreshProfile();
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
};
