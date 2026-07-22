
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

interface TeamProfileHeaderProps {
  teamName: string;
}

export const TeamProfileHeader = ({ teamName }: TeamProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="vice-card p-8 relative overflow-hidden">
      {/* Decorative header line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-cyan-500 to-purple-500"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full opacity-60 animate-float"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-40 animate-pulse"></div>
      
      <div className="flex items-center space-x-6 relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="vice-button p-4 rounded-xl vice-interactive group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <ArrowLeft size={28} className="relative z-10 drop-shadow-lg text-white" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="text-yellow-400 w-8 h-8 animate-pulse" />
            <h1 className="vice-title text-4xl text-transparent bg-clip-text vice-gradient animate-pulse-neon">
              {teamName || 'ЗАГРУЗКА...'}
            </h1>
          </div>
          <p className="vice-subtitle text-lg vice-text-accent">ПРОФИЛЬ КОМАНДЫ</p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="vice-text-secondary text-sm">ОНЛАЙН</span>
        </div>
      </div>
    </div>
  );
};
