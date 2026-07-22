
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePublicFriendships = (userId: string) => {
  const { data: friends, isLoading } = useQuery({
    queryKey: ['public-friends', userId],
    queryFn: async () => {
      if (!userId) return [];

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
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Форматируем данные чтобы всегда получать профиль друга
      return data.map(friendship => {
        const isInitiator = friendship.user_id === userId;
        return {
          id: friendship.id,
          status: friendship.status,
          created_at: friendship.created_at,
          friend: isInitiator ? friendship.friend : friendship.user
        };
      });
    },
    enabled: !!userId,
  });

  return {
    friends,
    isLoading
  };
};
