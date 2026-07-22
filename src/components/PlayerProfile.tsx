import React from "react";
import { ProfileSection } from "./ProfileSection";
import { RoleBasedStageManager } from "./RoleBasedStageManager";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PlayerProfile = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/")}
        className="vice-button p-4 rounded-xl vice-interactive group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <ArrowLeft
          size={28}
          className="relative z-10 drop-shadow-lg text-white"
        />
      </button>
      <ProfileSection />
      <RoleBasedStageManager />
    </div>
  );
};
