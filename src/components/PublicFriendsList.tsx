
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicFriendships } from '@/hooks/usePublicFriendships';

// GTA стиль аватарки
const avatars = [
  '👨‍💼', '👩‍💼', '🕴️', '👨‍🔧', '👩‍🔧', '👨‍🚀',
  '👩‍🚀', '👨‍💻', '👩‍💻', '🦹‍♂️', '🦹‍♀️', '🥷'
];

interface PublicFriendsListProps {
  userId: string;
  playerName: string;
}

export const PublicFriendsList: React.FC<PublicFriendsListProps> = ({
  userId,
  playerName
}) => {
  const { friends, isLoading } = usePublicFriendships(userId);

  const getAvatar = (avatarId: number) => {
    const avatarIndex = (avatarId || 1) - 1;
    return avatars[avatarIndex] || avatars[0];
  };

  if (isLoading) {
    return (
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>
        
        <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
          <Users className="mr-3 text-cyan-400 w-8 h-8" />
          ДРУЗЬЯ
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vice-card p-4 border border-cyan-400/20 animate-pulse">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full bg-cyan-400/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-400/20" />
                  <Skeleton className="h-3 w-16 bg-gray-400/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="vice-card p-8 relative">
        <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>
        
        <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
          <Users className="mr-3 text-cyan-400 w-8 h-8" />
          ДРУЗЬЯ
        </h2>
        
        <div className="text-center py-8 text-gray-400 font-mono">
          У {playerName} пока нет друзей
        </div>
      </div>
    );
  }

  return (
    <div className="vice-card p-8 relative">
      <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none"></div>
      
      <h2 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient mb-6 flex items-center">
        <Users className="mr-3 text-cyan-400 w-8 h-8" />
        ДРУЗЬЯ ({friends.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map((friendship) => (
          <Link
            key={friendship.id}
            to={`/player/${friendship.friend.id}`}
            className="vice-card p-4 border border-cyan-400/20 hover:border-cyan-400/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center text-2xl border border-pink-500/50 group-hover:scale-110 transition-transform">
                {friendship.friend.avatar_id ? 
                  getAvatar(friendship.friend.avatar_id) : 
                  <User className="h-6 w-6 text-pink-400" />
                }
              </div>
              <div className="flex-1">
                <div className="font-bold font-mono text-cyan-300 group-hover:text-cyan-200 transition-colors">
                  {friendship.friend.full_name || friendship.friend.username}
                </div>
                <div className="text-sm text-purple-300 font-mono">
                  {friendship.friend.rank_title}
                </div>
                <div className="text-xs text-green-400 font-mono">
                  ${friendship.friend.points.toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
