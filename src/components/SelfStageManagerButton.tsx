import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SelfStageManager } from "./SelfStageManager";
import { TeamMember } from "./TeamMemberManagement";

interface SelfStageManagerButtonProps {
  availableStages: string[];
  teamId: string;
  teamMembers: TeamMember[];
}

export const SelfStageManagerButton = ({
  availableStages,
  teamId,
  teamMembers = [],
}: SelfStageManagerButtonProps) => {
  const [showAddStage, setShowAddStage] = useState(false);

  console.log("SelfStageManagerButton: availableStages =", availableStages);
  console.log("SelfStageManagerButton: showAddStage =", showAddStage);

  if (showAddStage) {
    return (
      <SelfStageManager
        teamMembers={teamMembers}
        teamId={teamId}
        availableStages={availableStages}
        onClose={() => {
          console.log("Закрываем SelfStageManager");
          setShowAddStage(false);
        }}
      />
    );
  }

  return (
    <Button
      onClick={() => {
        console.log("Открываем SelfStageManager");
        setShowAddStage(true);
      }}
      size="sm"
      className="flex items-center gap-2"
    >
      <Plus size={16} />
      Добавить этап
    </Button>
  );
};
