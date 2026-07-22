
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const NotificationSystem = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Настройка системы уведомлений для пользователя:', user.id);

    // Подписка на личные сообщения
    const messagesChannel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Новое личное сообщение:', payload);
          toast.success('📧 Новое личное сообщение!', {
            description: 'У вас есть непрочитанное сообщение',
          });
        }
      )
      .subscribe();

    // Подписка на изменения профиля (ранги)
    const profileChannel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Обновление профиля:', payload);
          const oldProfile = payload.old as any;
          const newProfile = payload.new as any;
          
          if (oldProfile.rank_title !== newProfile.rank_title) {
            toast.success('⭐ Новый ранг!', {
              description: `Поздравляем! Вы достигли ранга: ${newProfile.rank_title}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Отключение системы уведомлений');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  return null;
};
