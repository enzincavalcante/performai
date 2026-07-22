
import React from 'react';
import { Users, Trophy, DollarSign } from 'lucide-react';

interface TeamStatsCardsProps {
  totalPoints: number;
  memberCount: number;
  avgPoints: number;
  treasuryBalance: number;
}

export const TeamStatsCards = ({ totalPoints, memberCount, avgPoints, treasuryBalance }: TeamStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="vice-card p-6 relative overflow-hidden border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-900/30 to-orange-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="gta-nav-text text-sm text-yellow-300">ОБЩИЕ ДОЛЛАРЫ</h3>
          <div className="relative">
            <Trophy className="h-8 w-8 text-yellow-400 filter drop-shadow-lg" />
            <div className="absolute inset-0 h-8 w-8 text-yellow-400 opacity-50 animate-ping">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
        </div>
        <div className="gta-title text-4xl text-green-400 relative z-10 filter drop-shadow-lg">
          ${totalPoints.toLocaleString()}
        </div>
      </div>

      <div className="vice-card p-6 relative overflow-hidden border-2 border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-cyan-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="gta-nav-text text-sm text-blue-300">УЧАСТНИКОВ</h3>
          <div className="relative">
            <Users className="h-8 w-8 text-cyan-400 filter drop-shadow-lg" />
            <div className="absolute inset-0 h-8 w-8 text-cyan-400 opacity-50 animate-ping">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>
        <div className="gta-title text-4xl text-cyan-400 relative z-10 filter drop-shadow-lg">
          {memberCount}
        </div>
      </div>

      <div className="vice-card p-6 relative overflow-hidden border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="gta-nav-text text-sm text-purple-300">СРЕДНИЙ ДОЛЛАР</h3>
          <div className="relative">
            <Trophy className="h-8 w-8 text-purple-400 filter drop-shadow-lg" />
            <div className="absolute inset-0 h-8 w-8 text-purple-400 opacity-50 animate-ping">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
        </div>
        <div className="gta-title text-4xl text-purple-400 relative z-10 filter drop-shadow-lg">
          ${avgPoints.toLocaleString()}
        </div>
      </div>

      <div className="vice-card p-6 relative overflow-hidden border-2 border-green-500/50 bg-gradient-to-br from-green-900/30 to-emerald-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="gta-nav-text text-sm text-green-300">КАЗНА ОРГАНИЗАЦИИ</h3>
          <div className="relative">
            <DollarSign className="h-8 w-8 text-green-400 filter drop-shadow-lg" />
            <div className="absolute inset-0 h-8 w-8 text-green-400 opacity-50 animate-ping">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>
        <div className="gta-title text-4xl text-emerald-400 relative z-10 filter drop-shadow-lg">
          ${treasuryBalance.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
