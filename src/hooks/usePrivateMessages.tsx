
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const usePrivateMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Получаем все сообщения пользователя
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['private-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          id,
          subject,
          message,
          is_read,
          created_at,
          sender_id,
          recipient_id,
          sender:profiles!private_messages_sender_id_fkey(
            id,
            username,
            full_name,
            avatar_id
          ),
          recipient:profiles!private_messages_recipient_id_fkey(
            id,
            username,
            full_name,
            avatar_id
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Получаем диалоги (группированные по собеседникам)
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id || !messages) return [];

      const conversationsMap = new Map();

      messages.forEach((message) => {
        const isOutgoing = message.sender_id === user.id;
        const partnerId = isOutgoing ? message.recipient_id : message.sender_id;
        const partner = isOutgoing ? message.recipient : message.sender;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partnerId,
            partner,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          });
        }

        const conversation = conversationsMap.get(partnerId);
        conversation.messages.push(message);

        // Считаем непрочитанные сообщения
        if (!message.is_read && !isOutgoing) {
          conversation.unreadCount++;
        }

        // Обновляем последнее сообщение если это сообщение новее
        if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
        }
      });

      return Array.from(conversationsMap.values()).sort(
        (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
    },
    enabled: !!user?.id && !!messages,
  });

  // Отправка сообщения
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, message }: {
      recipientId: string;
      message: string;
    }) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message: message.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  // Отметка сообщений как прочитанные
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('private_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('recipient_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['private-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages,
    conversations,
    messagesLoading,
    conversationsLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
  };
};
