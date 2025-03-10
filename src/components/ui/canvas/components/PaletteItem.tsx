'use client';

import { useDraggable } from '@dnd-kit/core';
import { PaletteItem as PaletteItemType } from '../interfaces/types';

interface PaletteItemProps {
  item: PaletteItemType;
  isDragOverlay?: boolean;
}

export function PaletteItem({ item, isDragOverlay }: PaletteItemProps) {
  const itemId = `palette-${item.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: itemId,
    data: {
      id: item.id,
      type: item.type,
      label: item.label,
      icon: item.icon,
      size: { width: 150, height: 80 }
    },
  });

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
      className={`
        flex items-center gap-1.5 p-1.5 rounded-md 
        ${isDragOverlay ? 'cursor-grabbing' : 'cursor-grab'} 
        bg-white hover:bg-gray-50 
        border ${isDragOverlay ? 'border-primary/30' : 'border-border'}
        ${isDragOverlay ? 'shadow-xl ring-1 ring-primary/30' : 'shadow-sm'} 
        ${isDragging ? 'opacity-50 scale-95' : 'scale-100'}
        transition-all duration-150
      `}
      data-palette-item={item.id}
      data-item-type={item.type}
    >
      <div className={`p-0.5 rounded-md ${isDragOverlay ? 'bg-primary/15' : 'bg-primary/5'}`}>
        {item.icon}
      </div>
      <span className="text-xs font-medium text-gray-700">{item.label}</span>
    </div>
  );
} 