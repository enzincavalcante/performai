
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Получаем количество непрочитанных сообщений
  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from('private_messages')
        .select('id', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Проверяем каждые 30 секунд
  });

  // Real-time обновления для индикатора
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-indicator')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          setHasNewMessages(true);
          refetch(); // Обновляем счетчик
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          refetch(); // Обновляем счетчик при изменении статуса прочтения
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const clearNewMessagesIndicator = () => {
    setHasNewMessages(false);
  };

  return {
    unreadCount,
    hasNewMessages,
    clearNewMessagesIndicator,
  };
};
