import React from "react";
import { PlayerProfile } from "../components/PlayerProfile";

const PlayerProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <PlayerProfile />
      </div>
    </div>
  );
};

export default PlayerProfilePage;
