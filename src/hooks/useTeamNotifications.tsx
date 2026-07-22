
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationSettings {
  id: string;
  team_id: string;
  notify_stage_completion: boolean;
  notify_purchases: boolean;
  notify_new_members: boolean;
  notify_rank_changes: boolean;
}

export const useTeamNotifications = (teamId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['team-notification-settings', teamId],
    queryFn: async (): Promise<NotificationSettings | null> => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from('team_notification_settings')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!teamId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      if (!teamId) throw new Error('Team ID is required');

      // Сначала пытаемся обновить существующую запись
      const { data: existingData } = await supabase
        .from('team_notification_settings')
        .select('id')
        .eq('team_id', teamId)
        .single();

      if (existingData) {
        // Обновляем существующую запись
        const { data, error } = await supabase
          .from('team_notification_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('team_id', teamId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Создаем новую запись
        const { data, error } = await supabase
          .from('team_notification_settings')
          .insert({
            team_id: teamId,
            notify_stage_completion: true,
            notify_purchases: true,
            notify_new_members: true,
            notify_rank_changes: true,
            ...newSettings,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-notification-settings', teamId] });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ message, type }: { message: string; type: string }) => {
      if (!teamId) throw new Error('Team ID is required');
      if (!user?.id) throw new Error('Пользователь не авторизован');

      const { data, error } = await supabase.rpc('send_team_notification', {
        team_id_param: teamId,
        message_text: message,
        notification_type: type
      });

      if (error) throw error;
      return data;
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
    sendNotification: sendNotificationMutation.mutateAsync,
    isSending: sendNotificationMutation.isPending,
  };
};
