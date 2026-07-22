
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SharedStage {
  id: string;
  stage_id: string;
  shared_with_user_id: string;
  share_percentage: number;
  points_received: number;
  created_at: string;
  created_by: string;
  description: string | null;
}

export const useSharedStages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sharedStages, isLoading } = useQuery({
    queryKey: ['shared-stages', user?.id],
    queryFn: async (): Promise<SharedStage[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('shared_stages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки разделенных этапов:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const shareStageWithUsersMutation = useMutation({
    mutationFn: async ({ 
      stageId, 
      userIds, 
      description 
    }: { 
      stageId: string; 
      userIds: string[]; 
      description?: string; 
    }) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      console.log('Разделение этапа:', { stageId, userIds, description });

      const { error } = await supabase.rpc('share_stage_with_users', {
        stage_id_param: stageId,
        user_ids: userIds,
        description_param: description || null
      });

      if (error) {
        console.error('Ошибка разделения этапа:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-stages'] });
      queryClient.invalidateQueries({ queryKey: ['player-stages'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error) => {
      console.error('Ошибка в shareStageWithUsersMutation:', error);
    }
  });

  return {
    sharedStages: sharedStages || [],
    isLoading,
    shareStageWithUsers: shareStageWithUsersMutation.mutateAsync,
    isSharing: shareStageWithUsersMutation.isPending,
  };
};
