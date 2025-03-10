'use client';

import { useDroppable } from '@dnd-kit/core';
import { CanvasItem as CanvasItemType } from '../interfaces/types';
import { CanvasItem } from './CanvasItem';

interface A4CanvasProps {
  zoom: number;
  items: Array<CanvasItemType & {
    isSelected?: boolean;
    ResizeHandles?: React.ReactNode;
    onDelete?: (index: number) => void;
    setSelectedItemIndex: React.Dispatch<React.SetStateAction<number | null>>;
  }>;
}

export function A4Canvas({ zoom, items }: A4CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'a4-canvas',
  });

  // A4 boyutlarını zoom'a göre ölçekle
  const scaledWidth = 612 * zoom;
  const scaledHeight = 792 * zoom;

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 relative flex justify-center py-10">
      <div
        ref={setNodeRef}
        id="a4-canvas"
        className={`relative border border-gray-300 shadow-lg ${isOver ? 'ring-2 ring-primary/50' : ''}`}
        style={{
          width: scaledWidth,
          height: scaledHeight,
          backgroundColor: 'white',
          position: 'relative',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            pointerEvents: 'none'
          }}
        />
        <div className="relative w-full h-full" style={{ position: 'relative', zIndex: 1 }}>
          {items.map((item, index) => (
            <CanvasItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              zoom={zoom}
              isSelected={item.isSelected}
              ResizeHandles={item.ResizeHandles}
              onDelete={item.onDelete}
              setSelectedItemIndex={item.setSelectedItemIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 