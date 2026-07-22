import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Trophy,
  Trash2,
  Plus,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { usePlayerStages } from "@/hooks/usePlayerStages";
import { parse } from "path";
import { useAuth } from "@/hooks/useAuth";

export interface TeamMember {
  id: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    points: number;
    rank_title: string;
  } | null;
}

interface TeamMemberManagementProps {
  member: TeamMember;
  isLeader: boolean;
  isAdmin: boolean;
  teamId: string;
}

export const TeamMemberManagement = ({
  member,
  isLeader,
  isAdmin,
  teamId,
}: TeamMemberManagementProps) => {
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const { user } = useAuth();
  const [points, setPoints] = useState("");
  const [stageName, setStageName] = useState("");
  const [stagePoints, setStagePoints] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const { stages, addStage, removeStage, isManaging } = usePlayerStages(
    member.user_id
  );

  const canManage = isLeader || isAdmin;

  if (!canManage) return null;

  const handleAddStage = async () => {
    if (!stageName || !stagePoints) return;

    try {
      console.log("Начинаем добавление этапа:", {
        targetUserId: member.user_id,
        stageName,
        points: parseInt(stagePoints),
        description,
      });

      await addStage({
        targetUserId: member.user_id,
        stageName,
        points: parseInt(stagePoints),
        description: description || undefined,
        teamId,
        verified: true,
      });

      toast({
        title: "УСПЕХ",
        description: `ЭТАП "${stageName}" ДОБАВЛЕН`,
      });

      setStageName("");
      setStagePoints("");
      setDescription("");
      setIsStageDialogOpen(false);
    } catch (error: any) {
      console.error("Ошибка добавления этапа:", error);
      toast({
        title: "ОШИБКА",
        description: error?.message || "НЕ УДАЛОСЬ ДОБАВИТЬ ЭТАП",
        variant: "destructive",
      });
    }
  };

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

  const onFeeChange = (e: string) => {
    const numeric = parseFloat(e);
    if (numeric < 0) {
      return setPoints("0");
    } else {
      return setPoints(e);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        {/* Управление баллами */}

        {/* Управление этапами */}
        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-400 font-mono text-xs"
            >
              <Trophy size={12} className="mr-1" />
              ЭТАП
            </Button>
          </DialogTrigger>
          <DialogContent className="vice-card border border-purple-500/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
                ДОБАВИТЬ ЭТАП
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Название этапа"
                className="bg-gray-800 border border-purple-500/30 text-cyan-300 font-mono"
              />
              <Input
                type="number"
                value={stagePoints}
                onChange={(e) => setStagePoints(e.target.value)}
                placeholder="Баллы за этап"
                className="bg-gray-800 border border-purple-500/30 text-cyan-300 font-mono"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание (необязательно)"
                className="bg-gray-800 border border-purple-500/30 text-cyan-300 font-mono"
              />
              <Button
                onClick={handleAddStage}
                disabled={!stageName || !stagePoints || isManaging}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-400 font-mono font-bold"
              >
                {isManaging ? "ОБРАБОТКА..." : "ДОБАВИТЬ ЭТАП"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
