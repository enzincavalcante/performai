
import React from 'react';
import { Clock, User, Edit, Trash2 } from 'lucide-react';

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

interface ReplyItemProps {
  reply: ForumReply;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const ReplyItem = ({ reply, canEdit, onEdit, onDelete, isDeleting }: ReplyItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="vice-card p-6 border border-cyan-400/30 bg-gray-800/50 hover:border-cyan-400/60 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 vice-gradient rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg flex-shrink-0">
          <span className="text-lg font-mono font-bold text-white filter drop-shadow-sm">
            {reply.profiles?.full_name?.[0] || reply.profiles?.username?.[0] || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300 font-mono font-bold">
                {reply.profiles?.full_name || reply.profiles?.username || 'Неизвестный пользователь'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono">
                <Clock className="h-4 w-4" />
                <span>{formatDate(reply.created_at)}</span>
              </div>
              {canEdit && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onEdit}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Редактировать"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Удалить"
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-cyan-300 font-mono leading-relaxed break-words">
            {reply.content}
          </div>
        </div>
      </div>
    </div>
  );
};
