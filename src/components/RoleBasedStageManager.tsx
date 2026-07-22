import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePlayerStages } from "@/hooks/usePlayerStages";
import { useTeams } from "@/hooks/useTeams";
import { StageShareDialog } from "./StageShareDialog";
import { SelfStageManagerButton } from "./SelfStageManagerButton";
import { useAuth } from "@/hooks/useAuth";

export const RoleBasedStageManager = () => {
  const { profile } = useProfile();
  const { userTeams } = useTeams();
  const { user } = useAuth();
  const { stages } = usePlayerStages(profile?.id);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const isMyProfile = profile?.id === user?.id;
  const userTeam = userTeams[0]?.teams;
  const userRole = profile?.role;

  // Определяем доступные этапы для каждой роли
  const getAvailableStages = () => {
    if (userRole === "manager") {
      return ["Залог", "Почтовые сборы"];
    } else if (userRole === "closer") {
      return ["Залог", "Почта", "Этап"];
    }
    return [];
  };

  const availableStages = getAvailableStages();

  const handleShareStage = (stage: any) => {
    setSelectedStage(stage);
    setShareDialogOpen(true);
  };

  const canShareStage = (stage: any) => {
    // Только закрывающие могут разделять этапы и только свои этапы
    return userRole === "closer" && stage.added_by === profile?.id;
  };

  return (
    <div className="space-y-6">
      {isMyProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Управление этапами
              <Badge variant={userRole === "closer" ? "default" : "secondary"}>
                {userRole === "manager" ? "Менеджер" : "Закрывающий"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Доступные этапы: {availableStages.join(", ")}
                </p>
                <SelfStageManagerButton availableStages={availableStages} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Этапы</CardTitle>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Пока пусто...</p>
          ) : (
            <div className="space-y-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{stage.stage_name}</h4>
                    <p className="text-sm text-gray-600">
                      {stage.points} баллов •{" "}
                      {new Date(stage.created_at).toLocaleDateString()}
                    </p>
                    {stage.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {stage.description}
                      </p>
                    )}
                  </div>

                  {canShareStage(stage) && (
                    <Button
                      onClick={() => handleShareStage(stage)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      Разделить
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {shareDialogOpen && selectedStage && userTeam && (
        <StageShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          stageId={selectedStage.id}
          stageName={selectedStage.stage_name}
          teamId={userTeam.id}
        />
      )}
    </div>
  );
};
