
import React from 'react';
import { Clock, User } from 'lucide-react';
import { TopicActions } from './TopicActions';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

interface TopicContentProps {
  topic: ForumTopic;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const TopicContent = ({ topic, canEdit, onEdit, onDelete }: TopicContentProps) => {
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
    <div className="vice-card p-8 relative border-2 border-green-500/50 bg-gradient-to-br from-gray-900/90 to-green-900/90">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg"></div>
      
      <div className="relative z-10 space-y-6">
        {/* Заголовок темы с кнопками управления */}
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient flex-1 pr-4">
            {topic.title}
          </h1>
          <TopicActions 
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {/* Информация об авторе и дате */}
        <div className="flex items-center justify-between text-sm border-b border-gray-600/50 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 vice-gradient rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg">
              <span className="text-sm font-mono font-bold text-white filter drop-shadow-sm">
                {topic.profiles?.full_name?.[0] || topic.profiles?.username?.[0] || '?'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 font-mono font-bold">
                  {topic.profiles?.full_name || topic.profiles?.username || 'Неизвестный автор'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 font-mono">
                <Clock className="h-4 w-4" />
                <span>Создано: {formatDate(topic.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Содержимое темы */}
        <div className="prose prose-invert max-w-none">
          <div className="text-cyan-300 font-mono text-lg leading-relaxed whitespace-pre-wrap">
            {topic.content}
          </div>
        </div>
      </div>
    </div>
  );
};
