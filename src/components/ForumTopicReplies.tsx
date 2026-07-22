
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { ReplyForm } from './ReplyForm';
import { ReplyList } from './ReplyList';
import { ReplyEditDialog } from './ReplyEditDialog';

interface ForumTopicRepliesProps {
  topicId: string;
  canReply: boolean;
  isTeamLeader: boolean;
}

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

export const ForumTopicReplies = ({ topicId, canReply, isTeamLeader }: ForumTopicRepliesProps) => {
  const [editingReply, setEditingReply] = useState<ForumReply | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: replies, isLoading } = useQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: async (): Promise<ForumReply[]> => {
      const { data, error } = await supabase
        .from('organization_forum_replies')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Получаем профили отдельно
      if (!data || data.length === 0) return [];

      const userIds = data.map(reply => reply.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      // Объединяем данные
      const result = data.map(reply => ({
        ...reply,
        profiles: profiles?.find(profile => profile.id === reply.user_id) || undefined
      }));

      return result;
    },
    enabled: !!topicId,
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      const { error } = await supabase
        .from('organization_forum_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      toast({
        title: "УСПЕХ",
        description: "КОММЕНТАРИЙ УДАЛЕН",
      });
    },
    onError: (error) => {
      console.error('Ошибка удаления комментария:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ УДАЛИТЬ КОММЕНТАРИЙ",
        variant: "destructive",
      });
    }
  });

  const handleDeleteReply = async (replyId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      deleteReplyMutation.mutate(replyId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <MessageCircle className="h-6 w-6 text-cyan-400" />
        <h3 className="text-xl font-bold font-mono text-transparent bg-clip-text vice-gradient tracking-wider">
          КОММЕНТАРИИ ({replies?.length || 0})
        </h3>
      </div>

      <ReplyForm topicId={topicId} canReply={canReply} />

      <ReplyList
        replies={replies}
        isLoading={isLoading}
        canReply={canReply}
        currentUserId={user?.id}
        isTeamLeader={isTeamLeader}
        onEditReply={setEditingReply}
        onDeleteReply={handleDeleteReply}
        isDeleting={deleteReplyMutation.isPending}
      />

      {editingReply && (
        <ReplyEditDialog
          isOpen={!!editingReply}
          onClose={() => setEditingReply(null)}
          reply={editingReply}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
            setEditingReply(null);
          }}
        />
      )}
    </div>
  );
};
