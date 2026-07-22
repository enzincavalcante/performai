
import React from 'react';
import { Settings, Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTeamNotifications } from '@/hooks/useTeamNotifications';
import { useToast } from '@/components/ui/use-toast';

interface TeamNotificationSettingsProps {
  teamId: string;
  canManage: boolean;
}

export const TeamNotificationSettings = ({ teamId, canManage }: TeamNotificationSettingsProps) => {
  const { settings, isLoading, updateSettings, isUpdating } = useTeamNotifications(teamId);
  const { toast } = useToast();

  const handleSettingChange = async (setting: string, value: boolean) => {
    if (!canManage) return;

    try {
      await updateSettings({ [setting]: value });
      toast({
        title: "УСПЕХ",
        description: "НАСТРОЙКИ УВЕДОМЛЕНИЙ ОБНОВЛЕНЫ",
      });
    } catch (error) {
      console.error('Ошибка обновления настроек:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ ОБНОВИТЬ НАСТРОЙКИ",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="vice-card border border-cyan-400/30">
        <CardHeader>
          <CardTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
            <Settings className="mr-2 text-cyan-400" size={20} />
            НАСТРОЙКИ УВЕДОМЛЕНИЙ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-cyan-400/20 rounded w-3/4"></div>
                <div className="h-6 bg-pink-500/20 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const settingsConfig = [
    {
      key: 'notify_stage_completion',
      label: 'Уведомления о закрытии этапов',
      icon: '🎯',
      description: 'Получать уведомления о завершении этапов проектов'
    },
    {
      key: 'notify_purchases',
      label: 'Уведомления о покупках',
      icon: '💰',
      description: 'Получать уведомления о покупках участников команды'
    },
    {
      key: 'notify_new_members',
      label: 'Уведомления о новых участниках',
      icon: '👥',
      description: 'Получать уведомления о присоединении новых участников'
    },
    {
      key: 'notify_rank_changes',
      label: 'Уведомления об изменении рангов',
      icon: '⭐',
      description: 'Получать уведомления о повышении рангов участников'
    }
  ];

  return (
    <Card className="vice-card border border-cyan-400/30 relative overflow-hidden">
      <div className="absolute inset-0 border border-cyan-400/20 rounded-lg pointer-events-none"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
          <Settings className="mr-2 text-cyan-400" size={20} />
          НАСТРОЙКИ УВЕДОМЛЕНИЙ
        </CardTitle>
        {!canManage && (
          <p className="text-purple-300 font-mono text-sm">
            Только лидеры команды могут изменять настройки
          </p>
        )}
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        {settingsConfig.map((config) => {
          const isEnabled = Boolean(settings?.[config.key as keyof typeof settings] ?? true);
          
          return (
            <div key={config.key} className="flex items-center justify-between p-4 rounded-lg border border-pink-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-300 tracking-wider">
                      {config.label}
                    </span>
                    {isEnabled ? (
                      <Bell className="text-green-400" size={16} />
                    ) : (
                      <BellOff className="text-red-400" size={16} />
                    )}
                  </div>
                  <p className="text-sm text-purple-300 font-mono">
                    {config.description}
                  </p>
                </div>
              </div>
              
              <Switch
                checked={isEnabled}
                onCheckedChange={(value) => handleSettingChange(config.key, value)}
                disabled={!canManage || isUpdating}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
