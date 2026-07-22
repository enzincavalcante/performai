import React, { useState } from "react";
import { usePlayerStages } from "@/hooks/usePlayerStages";
import { Button } from "./ui/button";
import { Check, ChevronDown, ChevronUp, Icon, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const TeamMemberStages = ({ member, canManage = false }) => {
  const { stages, addStage, removeStage, isManaging, approveStage } =
    usePlayerStages(member.user_id);
  const [open, setOpen] = useState(false);

  const handleRemoveStage = async (stageId: string, stageName: string) => {
    if (window.confirm(`Удалить этап "${stageName}"?`)) {
      try {
        await removeStage(stageId);
        toast({
          title: "УСПЕХ",
          description: `ЭТАП "${stageName}" УДАЛЕН`,
        });
      } catch (error: any) {
        console.error("Ошибка удаления этапа:", error);
        toast({
          title: "ОШИБКА",
          description: error?.message || "НЕ УДАЛОСЬ УДАЛИТЬ ЭТАП",
          variant: "destructive",
        });
      }
    }
  };

  return (
    stages.length > 0 && (
      <div className="mt-2 space-y-1 w-full pb-6 pl-6">
        <div onClick={() => setOpen(!open)} className="items-center space-x-2 pb-4 cursor-pointer flex-row flex">
          <h3 className="text-sm font-medium text-gray-400">
            ЭТАПЫ 
          </h3>
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {open &&  stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex  ${
              stage?.verified
                ? "opacity-1"
                : canManage
                ? "opacity-1"
                : "opacity-50"
            }  items-center justify-between bg-gray-800/50 rounded px-2 py-2 text-sm w-[350px]`}
          >
            <span className="font-mono text-purple-400">
              {stage.stage_name}
            </span>
            <div className="flex items-center space-x-2">
              <span
                className={`font-mono text-${
                  stage.points > 0 ? "green" : "red"
                }-400`}
              >
                {stage.points > 0 ? `+${stage.points} $` : `${stage.points} $`}
              </span>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveStage(stage.id, stage.stage_name)}
                  disabled={isManaging}
                  className="h-6 w-6 p-0 text-red-400 border-red-400/30 hover:bg-red-400/20"
                >
                  <Trash2 size={10} />
                </Button>
              )}
              {canManage && !stage?.verified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    approveStage({ stageId: stage.id, userId: member.user_id })
                  }
                  disabled={isManaging}
                  className="h-6 w-6 p-0 text-green-400 border-greed-400/30 hover:bg-green-400/20"
                >
                  <Check size={10} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  );
};
