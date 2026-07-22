
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { Users, Target } from 'lucide-react';

export const ProfileRoleSelector = () => {
  const { profile, updateProfile, isProfileUpdating } = useProfile();

  const handleRoleChange = async (newRole: 'manager' | 'closer') => {
    try {
      await updateProfile({ role: newRole });
    } catch (error) {
      console.error('Ошибка обновления роли:', error);
    }
  };

  const currentRole = profile?.role || 'manager';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Роль в системе</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Текущая роль:</span>
          <Badge variant={currentRole === 'closer' ? 'default' : 'secondary'}>
            {currentRole === 'manager' ? 'Менеджер' : 'Закрывающий'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              currentRole === 'manager' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleChange('manager')}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Менеджер</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Работает с клиентами и выполняет основные этапы продаж
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Доступные этапы:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">Залог</Badge>
                <Badge variant="outline" className="text-xs">Почтовые сборы</Badge>
              </div>
            </div>
          </div>

          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              currentRole === 'closer' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleChange('closer')}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-medium">Закрывающий</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Закрывает сделки и может разделять вознаграждение с менеджерами
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Доступные этапы:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">Залог</Badge>
                <Badge variant="outline" className="text-xs">Почта</Badge>
                <Badge variant="outline" className="text-xs">Этап</Badge>
              </div>
              <p className="text-xs text-green-600 font-medium mt-2">
                + Может разделять этапы с командой
              </p>
            </div>
          </div>
        </div>

        {isProfileUpdating && (
          <p className="text-sm text-blue-600">Обновление роли...</p>
        )}
      </CardContent>
    </Card>
  );
};
