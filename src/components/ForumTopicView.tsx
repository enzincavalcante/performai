
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ForumTopicReplies } from './ForumTopicReplies';
import { useAuth } from '@/hooks/useAuth';
import { TopicEditDialog } from './TopicEditDialog';
import { useToast } from '@/components/ui/use-toast';
import { TopicHeader } from './TopicHeader';
import { TopicContent } from './TopicContent';

interface ForumTopicViewProps {
  topicId: string;
  teamId: string;
  canCreateTopics: boolean;
  onBack: () => void;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

export const ForumTopicView = ({ topicId, teamId, canCreateTopics, onBack }: ForumTopicViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: topic, isLoading, refetch } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<ForumTopic | null> => {
      const { data, error } = await supabase
        .from('organization_forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          created_by,
          updated_at
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Получаем профиль автора
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', data.created_by)
        .single();

      return {
        ...data,
        profiles: profile || undefined
      };
    },
    enabled: !!topicId,
  });

  // Проверяем, является ли пользователь участником команды
  const { data: isMember } = useQuery({
    queryKey: ['is-team-member', teamId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    },
    enabled: !!teamId && !!user?.id,
  });

  const handleDeleteTopic = async () => {
    if (!topic) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту тему? Это действие нельзя отменить.')) {
      try {
        const { error } = await supabase
          .from('organization_forum_topics')
          .delete()
          .eq('id', topicId);

        if (error) throw error;

        toast({
          title: "УСПЕХ",
          description: "ТЕМА УДАЛЕНА",
        });
        
        onBack();
      } catch (error) {
        console.error('Ошибка удаления темы:', error);
        toast({
          title: "ОШИБКА",
          description: "НЕ УДАЛОСЬ УДАЛИТЬ ТЕМУ",
          variant: "destructive",
        });
      }
    }
  };

  // Проверяем права пользователя на редактирование/удаление
  const canEditTopic = topic && (
    (user?.id === topic.created_by) || 
    canCreateTopics
  );

  if (isLoading) {
    return (
      <div className="vice-card p-8 relative border-2 border-green-500/50 bg-gradient-to-br from-gray-900/90 to-green-900/90">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 bg-green-400/20" />
            <Skeleton className="h-8 w-64 bg-cyan-400/20" />
          </div>
          <Skeleton className="h-6 w-full bg-purple-400/20" />
          <Skeleton className="h-32 w-full bg-cyan-400/20" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="vice-card p-8 relative border-2 border-red-500/50 bg-gradient-to-br from-gray-900/90 to-red-900/90">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-300 font-mono text-xl tracking-wider">ТЕМА НЕ НАЙДЕНА</p>
          <button onClick={onBack} className="mt-4 bg-gradient-to-r from-purple-600 to-purple-800 border border-purple-400 text-white py-2 px-4 rounded font-mono font-bold tracking-wider">
            НАЗАД К ФОРУМУ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TopicHeader onBack={onBack} />

      <TopicContent 
        topic={topic}
        canEdit={!!canEditTopic}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={handleDeleteTopic}
      />

      {/* Комментарии */}
      <div className="vice-card p-8 relative border-2 border-cyan-500/50 bg-gradient-to-br from-gray-900/90 to-cyan-900/90">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg"></div>
        
        <div className="relative z-10">
          <ForumTopicReplies 
            topicId={topicId}
            canReply={!!isMember}
            isTeamLeader={canCreateTopics}
          />
        </div>
      </div>

      {/* Диалог редактирования темы */}
      <TopicEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        topic={topic}
        onUpdate={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
};
