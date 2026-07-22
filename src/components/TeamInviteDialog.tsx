
import React, { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { supabase } from '@/integrations/supabase/client';

interface TeamInviteDialogProps {
  teamId: string;
  teamName: string;
}

export const TeamInviteDialog = ({ teamId, teamName }: TeamInviteDialogProps) => {
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { inviteToTeam, isInviting } = useTeamInvitations();
  const { toast } = useToast();

  const searchUsers = async () => {
    if (!username.trim()) {
      console.log('Пустое имя пользователя для поиска');
      return;
    }
    
    console.log('Поиск пользователей по имени:', username);
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.rpc('find_user_by_username', {
        username_param: username
      });
      
      console.log('Результаты поиска:', data);
      
      if (error) {
        console.error('Ошибка поиска пользователей:', error);
        throw error;
      }
      
      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "НЕ НАЙДЕНО",
          description: "ПОЛЬЗОВАТЕЛИ С ТАКИМ ИМЕНЕМ НЕ НАЙДЕНЫ",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ошибка поиска пользователей:', error);
      toast({
        title: "ОШИБКА",
        description: "НЕ УДАЛОСЬ НАЙТИ ПОЛЬЗОВАТЕЛЕЙ",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async (userId: string, userFullName: string) => {
    console.log('Приглашаем пользователя:', { userId, userFullName, teamId });
    
    try {
      await inviteToTeam({ teamId, userId });
      
      console.log('Пользователь успешно приглашен');
      setUsername('');
      setSearchResults([]);
      setIsOpen(false);
      
      toast({
        title: "УСПЕХ",
        description: `${userFullName} ДОБАВЛЕН В ОРГАНИЗАЦИЮ`,
      });
    } catch (error) {
      console.error('Ошибка приглашения в организацию:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "НЕ УДАЛОСЬ ПРИГЛАСИТЬ ПОЛЬЗОВАТЕЛЯ";
      
      toast({
        title: "ОШИБКА",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchUsers();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs bg-gradient-to-r from-green-600 to-green-800 border border-green-400 text-white font-mono font-bold tracking-wider hover:scale-105 transition-all duration-300"
        >
          <UserPlus size={14} className="mr-1" />
          ПРИГЛАСИТЬ
        </Button>
      </DialogTrigger>
      <DialogContent className="vice-card border border-green-500/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient">
            ПРИГЛАСИТЬ В "{teamName}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите никнейм пользователя"
              className="bg-gray-800 border border-green-500/30 text-cyan-300 font-mono focus:border-green-500 focus:ring-green-500"
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
            <Button 
              onClick={searchUsers} 
              disabled={isSearching || !username.trim()}
              className="bg-gradient-to-r from-green-600 to-green-800 border border-green-400 font-mono font-bold"
            >
              <Search size={16} />
            </Button>
          </div>
          
          {isSearching && (
            <div className="text-center py-4">
              <div className="text-cyan-300 font-mono">ПОИСК...</div>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div 
                  key={user.user_id} 
                  className="flex items-center justify-between p-3 vice-card border border-cyan-400/30 hover:border-cyan-400/60 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white font-mono">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-sm text-cyan-300 font-mono">
                      @{user.username}
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleInvite(user.user_id, user.full_name || user.username)}
                    disabled={isInviting}
                    className="bg-gradient-to-r from-green-600 to-green-800 border border-green-400 font-mono font-bold text-xs"
                  >
                    {isInviting ? 'ДОБАВЛЕНИЕ...' : 'ДОБАВИТЬ'}
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                setUsername('');
                setSearchResults([]);
              }}
              className="border-purple-400 text-purple-400 font-mono tracking-wider hover:bg-purple-400/10"
            >
              ОТМЕНА
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
