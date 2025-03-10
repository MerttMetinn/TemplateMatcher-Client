'use client';

import { resizeHandles } from '../utils/constants';
import { getHandlePosition } from '../utils/helpers';

interface ResizeHandlesProps {
  index: number;
  onResizeStart: (event: React.MouseEvent, index: number, handle: string) => void;
}

export function ResizeHandles({ index, onResizeStart }: ResizeHandlesProps) {
  return (
    <>
      {resizeHandles.map((handle) => (
        <div
          key={handle.position}
          data-resize-handle={handle.position}
          className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full hover:scale-125 transition-transform"
          style={{
            cursor: handle.cursor,
            ...getHandlePosition(handle.position),
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
          onMouseDown={(e) => onResizeStart(e, index, handle.position)}
        />
      ))}
    </>
  );
} 