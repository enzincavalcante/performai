
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFriendships } from '@/hooks/useFriendships';

interface AddFriendButtonProps {
  targetUserId: string;
  className?: string;
}

export const AddFriendButton: React.FC<AddFriendButtonProps> = ({ 
  targetUserId, 
  className 
}) => {
  const { user } = useAuth();
  const { sendFriendRequest, isSending } = useFriendships();

  // Проверяем статус дружбы
  const { data: friendshipStatus, isLoading } = useQuery({
    queryKey: ['friendship-status', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || user.id === targetUserId) return null;

      const { data, error } = await supabase
        .from('friendships')
        .select('id, status, user_id, friend_id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && user.id !== targetUserId,
  });

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(targetUserId);
    } catch (error) {
      console.error('Ошибка добавления в друзья:', error);
    }
  };

  // Не показываем кнопку для самого себя или если идет загрузка
  if (!user || user.id === targetUserId || isLoading) {
    return null;
  }

  // Если дружба уже установлена
  if (friendshipStatus) {
    if (friendshipStatus.status === 'accepted') {
      return (
        <Button
          disabled
          className={`bg-green-600 hover:bg-green-600 text-white font-mono ${className}`}
        >
          <UserCheck className="mr-2 h-4 w-4" />
          ДРУЗЬЯ
        </Button>
      );
    }

    if (friendshipStatus.status === 'pending') {
      const isOutgoing = friendshipStatus.user_id === user.id;
      return (
        <Button
          disabled
          className={`bg-yellow-600 hover:bg-yellow-600 text-white font-mono ${className}`}
        >
          <Clock className="mr-2 h-4 w-4" />
          {isOutgoing ? 'ЗАЯВКА ОТПРАВЛЕНА' : 'ВХОДЯЩАЯ ЗАЯВКА'}
        </Button>
      );
    }

    if (friendshipStatus.status === 'blocked') {
      return (
        <Button
          disabled
          className={`bg-red-600 hover:bg-red-600 text-white font-mono ${className}`}
        >
          <UserX className="mr-2 h-4 w-4" />
          ЗАБЛОКИРОВАН
        </Button>
      );
    }
  }

  // Кнопка добавления в друзья
  return (
    <Button
      onClick={handleAddFriend}
      disabled={isSending}
      className={`vice-button font-mono tracking-wider ${className}`}
    >
      <UserPlus className="mr-2 h-4 w-4" />
      {isSending ? 'ОТПРАВКА...' : 'ДОБАВИТЬ В ДРУЗЬЯ'}
    </Button>
  );
};
