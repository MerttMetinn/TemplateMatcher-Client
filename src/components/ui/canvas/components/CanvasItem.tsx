'use client';

import { useDraggable } from '@dnd-kit/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Trash2 } from 'lucide-react';
import { CanvasItem as CanvasItemType } from '../interfaces/types';
import { getFontSize, getIconSize, getPadding } from '../utils/helpers';

interface CanvasItemProps {
  item: CanvasItemType;
  index: number;
  zoom: number;
  isSelected?: boolean;
  ResizeHandles?: React.ReactNode;
  onDelete?: (index: number) => void;
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export function CanvasItem({ 
  item, 
  index,
  zoom,
  isSelected, 
  ResizeHandles, 
  onDelete,
  setSelectedItemIndex
}: CanvasItemProps) {
  const itemId = `canvas-${item.id}-${index}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: itemId,
    data: { 
      index,
      id: item.id,
      type: item.type,
      label: item.label,
      icon: item.icon,
      position: item.position,
      size: item.size
    },
  });

  const fontSize = getFontSize(item.size.width, item.size.height) * zoom;
  const iconSize = getIconSize(item.size.width, item.size.height) * zoom;
  const padding = getPadding(item.size.width, item.size.height) * zoom;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${item.position.x * zoom}px`,
    top: `${item.position.y * zoom}px`,
    width: `${item.size.width * zoom}px`,
    height: `${item.size.height * zoom}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    fontSize: `${fontSize}px`,
    padding: `${padding}px`,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    zIndex: transform ? 10 : 1,
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: transform ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
    pointerEvents: 'auto',
    visibility: 'visible'
  };

  const iconStyle: React.CSSProperties = {
    width: `${iconSize}px`,
    height: `${iconSize}px`,
    minWidth: `${iconSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    backgroundColor: 'rgba(var(--primary) / 0.05)',
    borderRadius: '0.375rem',
    marginLeft: '4px'
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          id={itemId}
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={style}
          data-canvas-item={index}
          data-item-json={JSON.stringify({
            id: item.id,
            type: item.type,
            label: item.label,
            position: item.position,
            size: item.size
          })}
          className={`rounded-lg border bg-white relative ${
            isSelected ? 'border-primary ring-1 ring-primary' : 'border-[#e5e7eb]'
          } hover:border-primary/50 hover:shadow-md`}
        >
          <div className="flex items-center gap-2 h-full">
            <div style={iconStyle} className="flex items-center justify-center bg-primary/5 rounded-md ml-1">
              {item.icon}
            </div>
            <span className="text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis pr-2">
              {item.label}
            </span>
          </div>
          {ResizeHandles}
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content 
          className="min-w-[220px] bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[100]"
          alignOffset={-4}
        >
          <ContextMenu.Item 
            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
            onSelect={(e) => {
              e?.preventDefault();
              console.log('Silme işlemi tetiklendi, index:', index);
              if (onDelete) {
                onDelete(index);
                setSelectedItemIndex(null);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
} 