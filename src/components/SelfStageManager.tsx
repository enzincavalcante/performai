import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelfStages } from "@/hooks/useSelfStages";
import { toast } from "sonner";
import { TeamMember } from "./TeamMemberManagement";
import { useProfile } from "@/hooks/useProfile";

interface SelfStageManagerProps {
  availableStages: string[];
  onClose: () => void;
  teamId: string;
  teamMembers: TeamMember[];
}

export const SelfStageManager = ({
  availableStages,
  onClose,
  teamId,
  teamMembers = [],
}: SelfStageManagerProps) => {
  const { profile } = useProfile();
  const { addSelfStage, isAdding } = useSelfStages({ teamId });
  const [stageName, setStageName] = useState("");
  const [divideWith, setDivideWith] = useState("");
  const [divideWithName, setDivideWithName] = useState("");
  const [divideSum, setDivideSum] = useState(0);
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");

  const onDivideWithSelect = (e: string) => {
    if (e === "Никому") {
      setDivideWith("");
      setDivideWithName("");
      return;
    }
    const thisMember = teamMembers.find((m) => m.profiles?.full_name === e);
    if (thisMember) {
      setDivideWith(thisMember.user_id);
      setDivideWithName(e);
    }
  };

  const getPointsForStage = (stage: string) => {
    switch (stage) {
      case "Залог":
        return 500;
      case "Почтовые сборы":
        return 200;
      case "Почта":
        return 300;
      case "Этап":
        return 1000;
      default:
        return 100;
    }
  };

  const handleStageSelect = (selectedStage: string) => {
    console.log("Выбран этап:", selectedStage);
    setStageName(selectedStage);
    setPoints(getPointsForStage(selectedStage).toString());
  };

  const onShareSumChange = (e: string) => {
    const numSum = parseInt(e);
    const numPoints = parseInt(points);
    if (isNaN(numSum) || numSum <= 0) {
      setDivideSum(0);
    }
    if (numSum > numPoints - 1) {
      setDivideSum(numPoints - 1);
    } else {
      setDivideSum(numSum);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Начинаем добавление этапа:", {
      stageName,
      points,
      description,
    });

    if (!stageName || !points) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      toast.error("Количество баллов должно быть положительным числом");
      return;
    }

    try {
      console.log("Вызываем addSelfStage с параметрами:", {
        stageName,
        points: pointsNum,
        description: description.trim() || undefined,
      });

      await addSelfStage({
        stageName,
        points: pointsNum,
        description: description.trim() || undefined,
        sharedWith: divideWith,
        shareSum: divideSum,
      });

      console.log("Этап успешно добавлен");
      toast.success(
        `Этап "${stageName}" успешно добавлен (+${pointsNum} баллов)`
      );
      onClose();
    } catch (error: any) {
      console.error("Ошибка добавления этапа:", error);
      toast.error(error.message || "Ошибка добавления этапа");
    }
  };

  if (availableStages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            У вас нет доступных этапов для добавления
          </p>
          <Button onClick={onClose} className="w-full mt-4">
            Закрыть
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить новый этап</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="points">Название этапа *</Label>
            <Input
              id="stageName"
              value={stageName}
              onChange={(e) => {
                setStageName(e.target.value);
              }}
              required
            />
          </div>

          <div>
            <Label htmlFor="points">Количество баллов *</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => {
                console.log("Изменение баллов:", e.target.value);
                setPoints(e.target.value);
              }}
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание этапа..."
            />
          </div>
          {profile?.role === "closer" && (
            <div>
              <Label htmlFor="stageName">Разделить с...</Label>
              <Select value={divideWithName} onValueChange={onDivideWithSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите получателя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Никому">Никому</SelectItem>
                  {teamMembers
                    .filter((el) => el.user_id !== profile?.id)
                    .map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.profiles?.full_name}
                      >
                        {member.profiles?.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {!!divideWith.length && (
            <div>
              <Label htmlFor="points">Доля</Label>
              <Input
                id="share_points"
                type="number"
                value={divideSum}
                onChange={(e) => {
                  onShareSumChange(e.target.value);
                }}
                min="0"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Добавление..." : "Добавить этап"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
