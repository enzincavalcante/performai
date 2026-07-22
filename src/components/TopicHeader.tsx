
import React from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface TopicHeaderProps {
  onBack: () => void;
}

export const TopicHeader = ({ onBack }: TopicHeaderProps) => {
  return (
    <div className="vice-card p-6 relative border-2 border-green-500/50 bg-gradient-to-br from-gray-900/90 to-green-900/90">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-purple-600 to-purple-800 border-2 border-purple-400 text-white py-2 px-4 rounded-lg font-mono font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>НАЗАД К ФОРУМУ</span>
        </button>
        <div className="flex items-center space-x-2 text-green-400 font-mono">
          <MessageCircle className="h-5 w-5" />
          <span>ПРОСМОТР ТЕМЫ</span>
        </div>
      </div>
    </div>
  );
};
