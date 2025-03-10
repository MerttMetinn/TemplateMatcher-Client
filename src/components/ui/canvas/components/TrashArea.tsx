'use client';

import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

export function TrashArea() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash-area',
  });

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <div
        ref={setNodeRef}
        className={`flex justify-center items-center p-1.5 rounded-md transition-colors ${
          isOver ? 'bg-red-100' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <Trash2 className={`w-4 h-4 ${isOver ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
    </div>
  );
} 