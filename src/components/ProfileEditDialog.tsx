
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

const profileSchema = z.object({
  full_name: z.string().max(100, 'Имя не должно превышать 100 символов').optional(),
  username: z.string().min(1, 'Никнейм обязателен').max(50, 'Никнейм не должен превышать 50 символов'),
  status: z.string().max(200, 'Статус не должен превышать 200 символов').optional(),
  avatar_id: z.number().min(1).max(12),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: () => void;
}

// GTA стиль аватарки
const avatars = [
  '👨‍💼', '👩‍💼', '🕴️', '👨‍🔧', '👩‍🔧', '👨‍🚀',
  '👩‍🚀', '👨‍💻', '👩‍💻', '🦹‍♂️', '🦹‍♀️', '🥷'
];

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      username: profile.username,
      status: profile.status || '',
      avatar_id: profile.avatar_id || 1,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name || null,
          username: data.username,
          status: data.status || null,
          avatar_id: data.avatar_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Ошибка обновления профиля:', error);
        return;
      }

      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-pink-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
            РЕДАКТИРОВАТЬ ПРОФИЛЬ
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Выбор аватарки */}
            <FormField
              control={form.control}
              name="avatar_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300 font-mono">АВАТАРКА</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-3">
                      {avatars.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => field.onChange(index + 1)}
                          className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                            field.value === index + 1
                              ? 'border-pink-500 bg-pink-500/20 scale-110'
                              : 'border-cyan-400/30 bg-gray-800 hover:border-pink-400/50'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Полное имя */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300 font-mono">ПОЛНОЕ ИМЯ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-gray-800 border-cyan-400/30 text-white font-mono"
                      placeholder="Введите ваше полное имя"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Никнейм */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300 font-mono">НИКНЕЙМ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-gray-800 border-cyan-400/30 text-white font-mono"
                      placeholder="Введите ваш никнейм"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Статус */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300 font-mono">СТАТУС</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-gray-800 border-cyan-400/30 text-white font-mono resize-none"
                      placeholder="Введите ваш статус..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                ОТМЕНА
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="vice-button font-mono tracking-wider"
              >
                {isLoading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
