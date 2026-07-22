
import React from 'react';
import { ReplyItem } from './ReplyItem';
import { Skeleton } from '@/components/ui/skeleton';

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

interface ReplyListProps {
  replies: ForumReply[] | undefined;
  isLoading: boolean;
  canReply: boolean;
  currentUserId?: string;
  isTeamLeader: boolean;
  onEditReply: (reply: ForumReply) => void;
  onDeleteReply: (replyId: string) => void;
  isDeleting: boolean;
}

export const ReplyList = ({
  replies,
  isLoading,
  canReply,
  currentUserId,
  isTeamLeader,
  onEditReply,
  onDeleteReply,
  isDeleting
}: ReplyListProps) => {
  const canEditReply = (reply: ForumReply) => {
    return currentUserId === reply.user_id || isTeamLeader;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="vice-card p-6 border border-cyan-400/30 bg-gray-800/50">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-cyan-400/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-purple-400/20" />
                <Skeleton className="h-16 w-full bg-cyan-400/20" />
                <Skeleton className="h-3 w-24 bg-gray-400/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!replies || replies.length === 0) {
    return (
      <div className="text-center py-12 vice-card border border-cyan-400/30 bg-gray-800/50">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-cyan-300 font-mono text-lg tracking-wider">ПОКА НЕТ КОММЕНТАРИЕВ</p>
        {canReply && (
          <p className="text-gray-400 font-mono text-sm mt-2">БУДЬТЕ ПЕРВЫМ, КТО ОСТАВИТ КОММЕНТАРИЙ</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          canEdit={canEditReply(reply)}
          onEdit={() => onEditReply(reply)}
          onDelete={() => onDeleteReply(reply.id)}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
