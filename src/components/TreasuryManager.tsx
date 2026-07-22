import React, { useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTreasuryManager } from "@/hooks/useTreasuryManager";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface TreasuryManagerProps {
  teamId: string;
  canManage: boolean;
}

export const TreasuryManager = ({
  teamId,
  canManage,
}: TreasuryManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { profile } = useProfile();
  const [description, setDescription] = useState("");
  const [contributorUserId, setContributorUserId] = useState<string>("");
  const { toast } = useToast();

  const { addTreasuryFunds, isAdding } = useTreasuryManager();
  const { teamMembers } = useTeamMembers(teamId);

  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);

    if (!amount || numAmount <= 0 || isNaN(numAmount)) {
      toast({
        title: "ОШИБКА",
        description: "ВВЕДИТЕ КОРРЕКТНУЮ СУММУ",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Начинаем пополнение казны:", {
        teamId,
        amount: numAmount,
        description,
        contributorUserId: user.id,
      });

      await addTreasuryFunds({
        teamId,
        amount: numAmount,
        description: description || undefined,
        contributorUserId: user.id,
      });

      toast({
        title: "УСПЕХ",
        description: `КАЗНА ПОПОЛНЕНА НА $${numAmount.toLocaleString()}!`,
      });

      setAmount("");
      setDescription("");
      setContributorUserId("");
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Ошибка пополнения казны:", error);
      toast({
        title: "ОШИБКА",
        description: error?.message || "НЕ УДАЛОСЬ ПОПОЛНИТЬ КАЗНУ",
        variant: "destructive",
      });
    }
  };
  const onChangeAmout = (e: string) => {
    const numAmount = parseFloat(e);
    if (numAmount <= 0 || isNaN(numAmount)) {
      setAmount("");
    }
    if (numAmount > profile.points) {
      setAmount(profile.points.toString());
    } else {
      setAmount(e);
    }
  };
  if (!canManage) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-800 border border-green-400 font-mono font-bold">
          <Plus className="mr-2 h-4 w-4" />
          ПОПОЛНИТЬ КАЗНУ
        </Button>
      </DialogTrigger>
      <DialogContent className="vice-card border border-green-500/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
            <DollarSign className="mr-2 text-green-400" />
            ПОПОЛНЕНИЕ КАЗНЫ
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-green-300 mb-2">
              СУММА ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => onChangeAmout(e.target.value)}
              placeholder="Введите сумму в долларах"
              className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-mono text-green-300 mb-2">
              ОТ ИМЕНИ УЧАСТНИКА
            </label>
            <Select
              value={contributorUserId}
              onValueChange={setContributorUserId}
            >
              <SelectTrigger className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono">
                <SelectValue placeholder="Выберите участника (необязательно)" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-green-500/30">
                <SelectItem value={user.id} className="text-gray-400 font-mono">
                  От себя
                </SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={"123"}
                    className="text-cyan-300 font-mono"
                  >
                    {member.profiles?.full_name ||
                      member.profiles?.username ||
                      "Безымянный участник"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          <div>
            <label className="block text-sm font-mono text-green-300 mb-2">
              ОПИСАНИЕ
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите цель пополнения (необязательно)"
              className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono resize-none"
              rows={3}
            />
          </div>

          <div className="bg-gray-800/50 p-3 rounded border border-green-500/30">
            <p className="text-xs font-mono text-green-300 mb-1">
              💡 ИНФОРМАЦИЯ:
            </p>
            <p className="text-xs font-mono text-gray-400">
              Средства будут добавлены в казну организации и отображены в
              истории транзакций.
            </p>
          </div>

          <Button
            onClick={handleAddFunds}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              isNaN(parseFloat(amount)) ||
              isAdding
            }
            className="w-full bg-gradient-to-r from-green-600 to-emerald-800 border border-green-400 font-mono font-bold"
          >
            {isAdding ? "ПОПОЛНЕНИЕ..." : "ПОПОЛНИТЬ КАЗНУ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
