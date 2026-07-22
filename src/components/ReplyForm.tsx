
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface ReplyFormProps {
  topicId: string;
  canReply: boolean;
}

export const ReplyForm = ({ topicId, canReply }: ReplyFormProps) => {
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReplyMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      const { error } = await supabase
        .from('organization_forum_replies')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      setReplyContent('');
      toast({
        title: "УСПЕХ",
        description: "КОММЕНТАРИЙ ДОБАВЛЕН",
      });
    },
    onError: (error) => {
      console.error('Ошибка создания комментария:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ДОБАВИТЬ КОММЕНТАРИЙ",
        variant: "destructive",
      });
    }
  });

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    createReplyMutation.mutate({ content: replyContent });
  };

  if (!canReply) return null;

  return (
    <form onSubmit={handleCreateReply} className="vice-card p-6 border border-green-400/30 bg-gray-800/50">
      <div className="space-y-4">
        <label className="block text-sm font-mono font-bold text-cyan-300 tracking-wider">
          ДОБАВИТЬ КОММЕНТАРИЙ
        </label>
        <Textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Введите ваш комментарий..."
          className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500 min-h-24"
          required
        />
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={createReplyMutation.isPending || !replyContent.trim()}
            className="bg-gradient-to-r from-green-600 to-green-800 border border-green-400 text-white py-2 px-6 rounded font-mono font-bold tracking-wider disabled:opacity-50 flex items-center space-x-2"
          >
            <Send size={16} />
            <span>{createReplyMutation.isPending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
