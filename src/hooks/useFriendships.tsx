
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFriendships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Получаем список друзей
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          created_at,
          user_id,
          friend_id,
          friend:profiles!friendships_friend_id_fkey(
            id,
            username,
            full_name,
            avatar_id,
            rank_title,
            points
          ),
          user:profiles!friendships_user_id_fkey(
            id,
            username,
            full_name,
            avatar_id,
            rank_title,
            points
          )
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Форматируем данные чтобы всегда получать профиль друга
      return data.map(friendship => {
        const isInitiator = friendship.user_id === user.id;
        return {
          id: friendship.id,
          status: friendship.status,
          created_at: friendship.created_at,
          friend: isInitiator ? friendship.friend : friendship.user
        };
      });
    },
    enabled: !!user?.id,
  });

  // Получаем входящие заявки в друзья
  const { data: incomingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          created_at,
          user_id,
          user:profiles!friendships_user_id_fkey(
            id,
            username,
            full_name,
            avatar_id,
            rank_title,
            points
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Отправка заявки в друзья
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Заявка отправлена!",
        description: "Заявка в друзья успешно отправлена",
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку",
        variant: "destructive",
      });
    },
  });

  // Принятие заявки в друзья
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Заявка принята!",
        description: "Теперь вы друзья",
      });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось принять заявку",
        variant: "destructive",
      });
    },
  });

  // Отклонение заявки в друзья
  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Заявка отклонена",
        description: "Заявка в друзья отклонена",
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отклонить заявку",
        variant: "destructive",
      });
    },
  });

  // Удаление из друзей
  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Друг удален",
        description: "Пользователь удален из списка друзей",
      });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить из друзей",
        variant: "destructive",
      });
    },
  });

  return {
    friends,
    incomingRequests,
    friendsLoading,
    requestsLoading,
    sendFriendRequest: sendFriendRequestMutation.mutateAsync,
    acceptFriendRequest: acceptFriendRequestMutation.mutateAsync,
    rejectFriendRequest: rejectFriendRequestMutation.mutateAsync,
    removeFriend: removeFriendMutation.mutateAsync,
    isSending: sendFriendRequestMutation.isPending,
    isAccepting: acceptFriendRequestMutation.isPending,
    isRejecting: rejectFriendRequestMutation.isPending,
    isRemoving: removeFriendMutation.isPending,
  };
};
