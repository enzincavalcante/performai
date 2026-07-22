
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSharedStages } from '@/hooks/useSharedStages';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StageShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  stageName: string;
  teamId: string;
}

export const StageShareDialog = ({ 
  isOpen, 
  onClose, 
  stageId, 
  stageName, 
  teamId 
}: StageShareDialogProps) => {
  const { user } = useAuth();
  const { shareStageWithUsers, isSharing } = useSharedStages();
  const { teamMembers } = useTeamMembers(teamId);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Фильтруем участников команды, исключая текущего пользователя
  const availableMembers = teamMembers.filter(member => 
    member.user_id !== user?.id && member.profiles
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Выберите хотя бы одного участника для разделения');
      return;
    }

    try {
      await shareStageWithUsers({
        stageId,
        userIds: selectedUsers,
        description: description.trim() || undefined
      });
      
      toast.success(`Этап "${stageName}" успешно разделен с ${selectedUsers.length} участниками`);
      onClose();
      setSelectedUsers([]);
      setDescription('');
    } catch (error: any) {
      console.error('Ошибка разделения этапа:', error);
      toast.error(error.message || 'Ошибка разделения этапа');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Разделить этап "{stageName}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание для разделения..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Выберите участников для разделения:</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {availableMembers.length === 0 ? (
                <p className="text-sm text-gray-500">Нет доступных участников для разделения</p>
              ) : (
                availableMembers.map(member => (
                  <div key={member.user_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.user_id}
                      checked={selectedUsers.includes(member.user_id)}
                      onCheckedChange={() => handleUserToggle(member.user_id)}
                    />
                    <Label 
                      htmlFor={member.user_id}
                      className="text-sm cursor-pointer"
                    >
                      {member.profiles?.full_name || member.profiles?.username}
                      <span className="text-gray-500 ml-1">
                        ({member.profiles?.role === 'manager' ? 'Менеджер' : 'Закрывающий'})
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Баллы будут разделены поровну между {selectedUsers.length + 1} участниками 
                (включая вас)
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={isSharing || selectedUsers.length === 0}
          >
            {isSharing ? 'Разделение...' : 'Разделить этап'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
