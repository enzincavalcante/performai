
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface TopicActionsProps {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const TopicActions = ({ canEdit, onEdit, onDelete }: TopicActionsProps) => {
  if (!canEdit) return null;

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onEdit}
        className="bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-400 text-white p-2 rounded font-mono font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
        title="Редактировать тему"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={onDelete}
        className="bg-gradient-to-r from-red-600 to-red-800 border border-red-400 text-white p-2 rounded font-mono font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
        title="Удалить тему"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
