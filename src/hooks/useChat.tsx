
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type ChatMessage = {
  id: string;
  team_id: string | null;
  user_id: string | null;
  message: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string | null;
  } | null;
};

export const useChat = (teamId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['chat-messages', teamId],
    queryFn: async () => {
      console.log('Загружаем сообщения для команды:', teamId);
      
      const query = supabase
        .from('chat_messages')
        .select(`
          id,
          team_id,
          user_id,
          message,
          created_at,
          profiles (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (teamId) {
        query.eq('team_id', teamId);
      } else {
        query.is('team_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Ошибка загрузки сообщений:', error);
        throw error;
      }

      console.log('Загружено сообщений:', data?.length || 0);
      return (data || []) as ChatMessage[];
    },
    enabled: !!user,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      console.log('Отправляем сообщение:', message);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          team_id: teamId || null,
          message
        });

      if (error) {
        console.error('Ошибка отправки сообщения:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Сообщение отправлено успешно');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', teamId] });
    },
    onError: (error) => {
      console.error('Ошибка при отправке:', error);
    },
  });

  // Подписка на новые сообщения в реальном времени
  useEffect(() => {
    if (!user) return;

    console.log('Подписываемся на обновления чата для команды:', teamId);

    const channel = supabase
      .channel(`chat-messages-${teamId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: teamId ? `team_id=eq.${teamId}` : 'team_id=is.null'
        },
        (payload) => {
          console.log('Получено новое сообщение:', payload);
          queryClient.invalidateQueries({ queryKey: ['chat-messages', teamId] });
        }
      )
      .subscribe((status) => {
        console.log('Статус подписки:', status);
      });

    return () => {
      console.log('Отписываемся от обновлений чата');
      supabase.removeChannel(channel);
    };
  }, [user, teamId, queryClient]);

  return {
    messages: messages || [],
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    error
  };
};
