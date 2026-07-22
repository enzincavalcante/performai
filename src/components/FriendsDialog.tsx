import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, Bell, Search, Check, X, Trash2, MessageCircle } from 'lucide-react';
import { useFriendships } from '@/hooks/useFriendships';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DirectMessageDialog } from './DirectMessageDialog';
import { MessagesDialog } from './MessagesDialog';

interface FriendsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// GTA стиль аватарки
const avatars = [
  '👨‍💼', '👩‍💼', '🕴️', '👨‍🔧', '👩‍🔧', '👨‍🚀',
  '👩‍🚀', '👨‍💻', '👩‍💻', '🦹‍♂️', '🦹‍♀️', '🥷'
];

export const FriendsDialog: React.FC<FriendsDialogProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [isMessagesDialogOpen, setIsMessagesDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    friends,
    incomingRequests,
    friendsLoading,
    requestsLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    isSending,
    isAccepting,
    isRejecting,
    isRemoving,
  } = useFriendships();

  // Поиск пользователей
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase.rpc('find_user_by_username', {
        username_param: searchQuery.trim()
      });

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.trim().length > 2,
  });

  const getAvatar = (avatarId: number) => {
    const avatarIndex = (avatarId || 1) - 1;
    return avatars[avatarIndex] || avatars[0];
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      setSearchQuery('');
    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
    }
  };

  const handleOpenMessages = (friend: any) => {
    setSelectedFriend(friend);
    setIsMessagesDialogOpen(true);
    onClose(); // Закрываем диалог друзей
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-gray-900 border-cyan-400/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex items-center">
              <Users className="mr-2 text-cyan-400" />
              ДРУЗЬЯ
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="friends" className="font-mono text-cyan-300">
                ДРУЗЬЯ {friends?.length ? `(${friends.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="requests" className="font-mono text-pink-300">
                ЗАЯВКИ 
                {incomingRequests?.length ? (
                  <Badge className="ml-2 bg-red-500 text-white">{incomingRequests.length}</Badge>
                ) : ''}
              </TabsTrigger>
              <TabsTrigger value="search" className="font-mono text-purple-300">
                ПОИСК
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {friendsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 vice-card">
                      <Skeleton className="w-12 h-12 rounded-full bg-cyan-400/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-400/20" />
                        <Skeleton className="h-3 w-24 bg-gray-400/20" />
                      </div>
                    </div>
                  ))
                ) : friends?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-mono">
                    У вас пока нет друзей
                  </div>
                ) : (
                  friends?.map((friendship) => (
                    <div key={friendship.id} className="flex items-center justify-between p-3 vice-card border border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center text-2xl border border-pink-500/50">
                          {getAvatar(friendship.friend.avatar_id)}
                        </div>
                        <div>
                          <div className="font-bold font-mono text-cyan-300">
                            {friendship.friend.full_name || friendship.friend.username}
                          </div>
                          <div className="text-sm text-purple-300 font-mono">
                            {friendship.friend.rank_title} • ${friendship.friend.points.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenMessages(friendship.friend)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-mono"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFriend(friendship.id)}
                          disabled={isRemoving}
                          className="font-mono"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {requestsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 vice-card">
                      <Skeleton className="w-12 h-12 rounded-full bg-pink-400/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-400/20" />
                        <Skeleton className="h-3 w-24 bg-gray-400/20" />
                      </div>
                    </div>
                  ))
                ) : incomingRequests?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-mono">
                    Нет новых заявок в друзья
                  </div>
                ) : (
                  incomingRequests?.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 vice-card border border-pink-400/20 hover:border-pink-400/40 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center text-2xl border border-pink-500/50">
                          {getAvatar(request.user.avatar_id)}
                        </div>
                        <div>
                          <div className="font-bold font-mono text-pink-300">
                            {request.user.full_name || request.user.username}
                          </div>
                          <div className="text-sm text-purple-300 font-mono">
                            {request.user.rank_title} • ${request.user.points.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                          disabled={isAccepting}
                          className="bg-green-600 hover:bg-green-700 text-white font-mono"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectFriendRequest(request.id)}
                          disabled={isRejecting}
                          className="font-mono"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-cyan-400/30 text-white font-mono"
                  />
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {searchLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-3 vice-card">
                        <Skeleton className="w-12 h-12 rounded-full bg-purple-400/20" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32 bg-gray-400/20" />
                          <Skeleton className="h-3 w-24 bg-gray-400/20" />
                        </div>
                      </div>
                    ))
                  ) : searchResults?.length === 0 && searchQuery.trim().length > 2 ? (
                    <div className="text-center py-8 text-gray-400 font-mono">
                      Пользователи не найдены
                    </div>
                  ) : (
                    searchResults?.map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-3 vice-card border border-purple-400/20 hover:border-purple-400/40 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center text-2xl border border-purple-500/50">
                            👤
                          </div>
                          <div>
                            <div className="font-bold font-mono text-purple-300">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-sm text-gray-400 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendFriendRequest(user.user_id)}
                          disabled={isSending}
                          className="vice-button font-mono"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          ДОБАВИТЬ
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedFriend && (
        <MessagesDialog
          isOpen={isMessagesDialogOpen}
          onClose={() => {
            setIsMessagesDialogOpen(false);
            setSelectedFriend(null);
          }}
          initialRecipientId={selectedFriend.id}
          initialRecipientUsername={selectedFriend.username}
        />
      )}
    </>
  );
};
