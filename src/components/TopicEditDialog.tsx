
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TopicEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    id: string;
    title: string;
    content: string;
  };
  onUpdate: () => void;
}

export const TopicEditDialog = ({ isOpen, onClose, topic, onUpdate }: TopicEditDialogProps) => {
  const [title, setTitle] = useState(topic.title);
  const [content, setContent] = useState(topic.content);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "ОШИБКА",
        description: "ЗАПОЛНИТЕ ВСЕ ПОЛЯ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organization_forum_topics')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', topic.id);

      if (error) throw error;

      toast({
        title: "УСПЕХ",
        description: "ТЕМА ОБНОВЛЕНА",
      });

      onUpdate();
    } catch (error) {
      console.error('Ошибка обновления темы:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ОБНОВИТЬ ТЕМУ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle(topic.title);
    setContent(topic.content);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="vice-card border border-green-500/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
            РЕДАКТИРОВАТЬ ТЕМУ
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
              ЗАГОЛОВОК ТЕМЫ
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок темы"
              className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-bold mb-3 text-cyan-300 tracking-wider">
              СОДЕРЖАНИЕ
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите содержание темы"
              className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500 min-h-32"
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
              className="bg-gradient-to-r from-green-600 to-green-800 border border-green-400 text-white py-2 px-6 rounded font-mono font-bold tracking-wider disabled:opacity-50"
            >
              {isLoading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
