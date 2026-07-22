
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReplyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reply: {
    id: string;
    content: string;
  };
  onUpdate: () => void;
}

export const ReplyEditDialog = ({ isOpen, onClose, reply, onUpdate }: ReplyEditDialogProps) => {
  const [content, setContent] = useState(reply.content);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "ОШИБКА",
        description: "КОММЕНТАРИЙ НЕ МОЖЕТ БЫТЬ ПУСТЫМ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organization_forum_replies')
        .update({
          content: content.trim()
        })
        .eq('id', reply.id);

      if (error) throw error;

      toast({
        title: "УСПЕХ",
        description: "КОММЕНТАРИЙ ОБНОВЛЕН",
      });

      onUpdate();
    } catch (error) {
      console.error('Ошибка обновления комментария:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ОБНОВИТЬ КОММЕНТАРИЙ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContent(reply.content);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="vice-card border border-cyan-500/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
            РЕДАКТИРОВАТЬ КОММЕНТАРИЙ
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
              СОДЕРЖАНИЕ КОММЕНТАРИЯ
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст комментария"
              className="bg-gray-800 border border-cyan-500/30 text-cyan-300 font-mono focus:border-cyan-500 focus:ring-cyan-500 min-h-24"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="border-purple-400 text-purple-400 font-mono tracking-wider hover:bg-purple-400/10"
            >
              ОТМЕНА
            </Button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-600 to-cyan-800 border border-cyan-400 text-white py-2 px-6 rounded font-mono font-bold tracking-wider disabled:opacity-50"
            >
              {isLoading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
