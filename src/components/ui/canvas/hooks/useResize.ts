import { useState, useRef, useCallback } from 'react';
import { CanvasItem } from '../interfaces/types';
import { MIN_WIDTH, MIN_HEIGHT } from '../utils/constants';

interface UseResizeProps {
  canvasItems: CanvasItem[];
  setCanvasItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
  zoom: number;
}

export function useResize({ canvasItems, setCanvasItems, zoom }: UseResizeProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const originalSize = useRef<{ width: number; height: number } | null>(null);
  const originalPosition = useRef<{ x: number; y: number } | null>(null);
  const resizeHandle = useRef<string | null>(null);

  // Zoom'a göre minimum boyutları hesapla
  const minWidth = MIN_WIDTH / zoom;
  const minHeight = MIN_HEIGHT / zoom;

  const handleResizeStart = useCallback((event: React.MouseEvent, index: number, handle: string) => {
    event.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: event.clientX, y: event.clientY };
    originalSize.current = { ...canvasItems[index].size };
    originalPosition.current = { ...canvasItems[index].position };
    resizeHandle.current = handle;
    setSelectedItemIndex(index);
  }, [canvasItems]);

  const handleResizeMove = useCallback((event: React.MouseEvent) => {
    if (!isResizing || !resizeStartPos.current || !originalSize.current || !originalPosition.current || !resizeHandle.current || selectedItemIndex === null) return;

    const deltaX = event.clientX - resizeStartPos.current.x;
    const deltaY = event.clientY - resizeStartPos.current.y;
    const handle = resizeHandle.current;
    const item = canvasItems[selectedItemIndex];
    const newSize = { ...originalSize.current };
    const newPosition = { ...originalPosition.current };

    // Zoom'a göre delta değerlerini ayarla
    const scaledDeltaX = deltaX / zoom;
    const scaledDeltaY = deltaY / zoom;

    // Köşe noktaları için özel mantık
    if (handle === 'top-left') {
      // Genişlik hesaplama
      const maxDeltaX = originalSize.current.width - minWidth;
      const constrainedDeltaX = scaledDeltaX > maxDeltaX ? maxDeltaX : scaledDeltaX;
      const newWidth = originalSize.current.width - constrainedDeltaX;
      if (newWidth >= minWidth) {
        newSize.width = newWidth;
        newPosition.x = originalPosition.current.x + constrainedDeltaX;
      }

      // Yükseklik hesaplama
      const maxDeltaY = originalSize.current.height - minHeight;
      const constrainedDeltaY = scaledDeltaY > maxDeltaY ? maxDeltaY : scaledDeltaY;
      const newHeight = originalSize.current.height - constrainedDeltaY;
      if (newHeight >= minHeight) {
        newSize.height = newHeight;
        newPosition.y = originalPosition.current.y + constrainedDeltaY;
      }
    }
    else if (handle === 'top-right') {
      // Genişlik hesaplama
      const newWidth = originalSize.current.width + scaledDeltaX;
      if (newWidth >= minWidth) {
        newSize.width = newWidth;
      }

      // Yükseklik hesaplama
      const maxDeltaY = originalSize.current.height - minHeight;
      const constrainedDeltaY = scaledDeltaY > maxDeltaY ? maxDeltaY : scaledDeltaY;
      const newHeight = originalSize.current.height - constrainedDeltaY;
      if (newHeight >= minHeight) {
        newSize.height = newHeight;
        newPosition.y = originalPosition.current.y + constrainedDeltaY;
      }
    }
    else if (handle === 'bottom-left') {
      // Genişlik hesaplama
      const maxDeltaX = originalSize.current.width - minWidth;
      const constrainedDeltaX = scaledDeltaX > maxDeltaX ? maxDeltaX : scaledDeltaX;
      const newWidth = originalSize.current.width - constrainedDeltaX;
      if (newWidth >= minWidth) {
        newSize.width = newWidth;
        newPosition.x = originalPosition.current.x + constrainedDeltaX;
      }

      // Yükseklik hesaplama
      const newHeight = originalSize.current.height + scaledDeltaY;
      if (newHeight >= minHeight) {
        newSize.height = newHeight;
      }
    }
    else if (handle === 'bottom-right') {
      newSize.width = Math.max(minWidth, originalSize.current.width + scaledDeltaX);
      newSize.height = Math.max(minHeight, originalSize.current.height + scaledDeltaY);
    }
    // Kenar noktaları için mantık
    else if (handle === 'right') {
      newSize.width = Math.max(minWidth, originalSize.current.width + scaledDeltaX);
    }
    else if (handle === 'left') {
      const maxDeltaX = originalSize.current.width - minWidth;
      const constrainedDeltaX = scaledDeltaX > maxDeltaX ? maxDeltaX : scaledDeltaX;
      const newWidth = originalSize.current.width - constrainedDeltaX;
      if (newWidth >= minWidth) {
        newSize.width = newWidth;
        newPosition.x = originalPosition.current.x + constrainedDeltaX;
      }
    }
    else if (handle === 'bottom') {
      newSize.height = Math.max(minHeight, originalSize.current.height + scaledDeltaY);
    }
    else if (handle === 'top') {
      const maxDeltaY = originalSize.current.height - minHeight;
      const constrainedDeltaY = scaledDeltaY > maxDeltaY ? maxDeltaY : scaledDeltaY;
      const newHeight = originalSize.current.height - constrainedDeltaY;
      if (newHeight >= minHeight) {
        newSize.height = newHeight;
        newPosition.y = originalPosition.current.y + constrainedDeltaY;
      }
    }

    // A4 sınırları içinde kalmasını sağla
    const canvasElement = document.getElementById('a4-canvas');
    if (canvasElement) {
      const canvasRect = canvasElement.getBoundingClientRect();
      const canvasWidth = canvasRect.width / zoom;
      const canvasHeight = canvasRect.height / zoom;
      
      // Sağ sınır kontrolü
      if (newPosition.x + newSize.width > canvasWidth) {
        if (handle.includes('right')) {
          newSize.width = canvasWidth - newPosition.x;
        } else {
          newPosition.x = canvasWidth - newSize.width;
        }
      }
      
      // Alt sınır kontrolü
      if (newPosition.y + newSize.height > canvasHeight) {
        if (handle.includes('bottom')) {
          newSize.height = canvasHeight - newPosition.y;
        } else {
          newPosition.y = canvasHeight - newSize.height;
        }
      }
      
      // Sol sınır kontrolü
      if (newPosition.x < 0) {
        newPosition.x = 0;
        if (handle.includes('left')) {
          const rightEdgePosition = originalPosition.current.x + originalSize.current.width;
          newSize.width = Math.max(minWidth, rightEdgePosition);
        }
      }
      
      // Üst sınır kontrolü
      if (newPosition.y < 0) {
        newPosition.y = 0;
        if (handle.includes('top')) {
          const bottomEdgePosition = originalPosition.current.y + originalSize.current.height;
          newSize.height = Math.max(minHeight, bottomEdgePosition);
        }
      }
    }

    setCanvasItems(prev => {
      const newItems = [...prev];
      newItems[selectedItemIndex] = {
        ...item,
        size: newSize,
        position: newPosition
      };
      return newItems;
    });
  }, [isResizing, canvasItems, selectedItemIndex, zoom, minWidth, minHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeStartPos.current = null;
    originalSize.current = null;
    originalPosition.current = null;
    resizeHandle.current = null;
  }, []);

  return {
    isResizing,
    selectedItemIndex,
    setSelectedItemIndex,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd
  };
} 