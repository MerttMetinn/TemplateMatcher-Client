'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
  pointerWithin,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { searchWithAdvancedParameters } from '@/app/services/api';
import toast, { Toaster } from 'react-hot-toast';

import { CanvasItem as CanvasItemType, SimilarTemplate } from './interfaces/types';
import { paletteCategories } from './utils/constants';
import { useResize } from './hooks/useResize';

import { PaletteItem } from './components/PaletteItem';
import { A4Canvas } from './components/A4Canvas';
import { CanvasStats } from './components/CanvasStats';
import { ExportImportPanel } from './components/ExportImportPanel';
import { ResizeHandles } from './components/ResizeHandles';
import { SimilarTemplatesPanel } from './components/SimilarTemplatesPanel';

interface DragData {
  id: string;
  type: 'text' | 'title' | 'list' | 'table' | 'figure';
  label?: string;
  icon?: React.ReactNode;
  index?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  dragOffset?: { x: number; y: number };
  initialPosition?: { x: number; y: number };
}

interface SearchElement {
  type: 'text' | 'title' | 'list' | 'table' | 'figure';
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function TemplateCreatorComponent() {
  const [canvasItems, setCanvasItems] = useState<CanvasItemType[]>([]);
  const [similarTemplates, setSimilarTemplates] = useState<SimilarTemplate[]>([]);
  const [activeItem, setActiveItem] = useState<DragData | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);

  const {
    isResizing,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd
  } = useResize({ 
    canvasItems, 
    setCanvasItems,
    zoom 
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!active?.data?.current) return;

    const data = active.data.current as DragData;
    
    if (active.id.toString().startsWith('canvas-')) {
      const parts = active.id.toString().split('-');
      const itemIndex = parseInt(parts[2], 10);
      if (!isNaN(itemIndex)) {
        const canvasItem = canvasItems[itemIndex];
        setActiveItem({
          ...data,
          position: canvasItem.position,
          size: canvasItem.size,
          index: itemIndex
        });
      }
    }

    setActiveItem(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;

      if (!active?.data?.current) {
        console.warn('Sürükleme verisi bulunamadı');
        return;
      }

      setActiveItem(null);

      if (over?.id === 'trash-area' && active.id.toString().startsWith('canvas-')) {
        const parts = active.id.toString().split('-');
        const itemIndex = parseInt(parts[2], 10);
        if (!isNaN(itemIndex)) {
          setCanvasItems((prev) => prev.filter((_, i) => i !== itemIndex));
        }
        return;
      }

      if (!over || over.id !== 'a4-canvas') return;

      const activeData = active.data.current as DragData;

      if (active.id.toString().startsWith('palette-')) {
        // Yeni öğe ekleme
        const canvasElement = document.getElementById('a4-canvas');
        if (!canvasElement) return;

        const rect = canvasElement.getBoundingClientRect();
        // Drop anındaki fare konumunu kullan
        const pointerX = over.rect.left + over.rect.width / 2;
        const pointerY = over.rect.top + over.rect.height / 2;

        // Canvas'ın sol-üstünü referans alan koordinatlar
        const relativeX = pointerX - rect.left;
        const relativeY = pointerY - rect.top;

        // Öğenin boyutları
        const itemWidth = activeData.size?.width ?? 150;
        const itemHeight = activeData.size?.height ?? 80;

        // Canvas boyutlarına (612x792) sığacak şekilde kısıtla ve fare imlecinin altına ortala
        const newX = Math.max(0, Math.min(relativeX / zoom - itemWidth / 2, 612 - itemWidth));
        const newY = Math.max(0, Math.min(relativeY / zoom - itemHeight / 2, 792 - itemHeight));

        const newItem: CanvasItemType = {
          id: activeData.id,
          type: activeData.type,
          label: activeData.label || '',
          icon: activeData.icon || null,
          position: { x: newX, y: newY },
          size: { width: itemWidth, height: itemHeight }
        };

        setCanvasItems((prev) => [...prev, newItem]);
      } else if (active.id.toString().startsWith('canvas-')) {
        // Mevcut öğeyi taşıma
        const parts = active.id.toString().split('-');
        const itemIndex = parseInt(parts[2], 10);
        if (!isNaN(itemIndex)) {
          const currentItem = canvasItems[itemIndex];
          if (currentItem) {
            const { delta } = event;
            // Mevcut pozisyona delta'yı ekleyerek yeni pozisyonu hesapla
            const newPosition = {
              x: Math.max(0, Math.min(currentItem.position.x + delta.x / zoom, 612 - currentItem.size.width)),
              y: Math.max(0, Math.min(currentItem.position.y + delta.y / zoom, 792 - currentItem.size.height))
            };

            setCanvasItems((prev) => {
              const newItems = [...prev];
              newItems[itemIndex] = {
                ...currentItem,
                position: newPosition
              };
              return newItems;
            });
          }
        }
      }
    } catch (error) {
      console.error('Sürükleme işlemi sırasında hata:', error);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-resize-handle]')) return;
    
    const canvasItem = target.closest('[data-canvas-item]');
    if (!canvasItem) {
      setSelectedItemIndex(null);
      return;
    }
    
    const itemId = canvasItem.getAttribute('data-canvas-item');
    if (itemId) {
      setSelectedItemIndex(parseInt(itemId));
    }
  };

  const handleClearCanvas = () => {
    setCanvasItems([]);
    setSelectedItemIndex(null);
  };

  const handleSearch = async () => {
    try {
      // Canvas üzerindeki öğeleri topla
      const elements: SearchElement[] = [];
      
      canvasItems.forEach((item) => {
        if (item.position && item.size) {
          elements.push({
            type: item.type,
            position: item.position,
            size: item.size
          });
        }
      });

      if (elements.length === 0) {
        toast.error('Arama yapmak için canvas üzerine en az bir öğe ekleyin.', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#FEF2F2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
          },
        });
        return;
      }

      toast.loading('Benzer şablonlar aranıyor...', { 
        id: 'search',
        position: 'top-right'
      });

      const searchData = { elements };
      
      console.log('Arama verisi:', searchData);
      
      const response = await searchWithAdvancedParameters(searchData);
      console.log('Backend API yanıtı:', response);
      
      if (response.images && Array.isArray(response.images)) {
        const formattedTemplates = response.images.map((item: { 
          image_url: string; 
          json_content: Record<string, unknown>;
        }) => ({
          image_url: item.image_url.startsWith('http') 
            ? item.image_url 
            : `http://localhost:5000${item.image_url}`,
          json_content: item.json_content
        }));
        
        setSimilarTemplates(formattedTemplates);
        
        // Benzer belge bulunamadı durumunu kontrol et
        if (formattedTemplates.length === 0) {
          toast.error('Benzer belge bulunamadı. Lütfen farklı bir düzen deneyin.', {
            id: 'search',
            duration: 3000,
            position: 'top-right',
            style: {
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
            },
          });
        } else {
          toast.success(`${formattedTemplates.length} benzer şablon bulundu.`, {
            id: 'search',
            duration: 2000,
            position: 'top-right',
          });
        }
      } else {
        setSimilarTemplates([]);
        toast.error('Benzer belge bulunamadı. Lütfen farklı bir düzen deneyin.', {
          id: 'search',
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#FEF2F2',
            color: '#B91C1C',
            border: '1px solid #FCA5A5',
          },
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Benzer şablonlar aranırken bir hata oluştu', {
        id: 'search',
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
        },
      });
    }
  };

  // Zoom değiştiren fonksiyonlar
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));   // max 3x
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3)); // min 0.3x
  const handleZoomReset = () => setZoom(1);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove as unknown as EventListener);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove as unknown as EventListener);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedItemIndex !== null && (event.key === 'Delete' || event.key === 'Backspace')) {
        if (!(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
          event.preventDefault();
          setCanvasItems((prev) => prev.filter((_, i) => i !== selectedItemIndex));
          setSelectedItemIndex(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            padding: '12px 16px',
          },
        }}
      />
      
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        <div className="w-44 lg:w-52 shrink-0 space-y-2 p-2 lg:p-3 bg-background rounded-xl border border-border shadow-sm overflow-y-auto">
          <h3 className="font-medium mb-2 lg:mb-3 text-sm text-gray-600">Elements</h3>
          
          {paletteCategories.map((category) => (
            <div key={category.id} className="mb-3">
              <h4 className="text-xs font-medium text-gray-500 mb-1.5">{category.title}</h4>
              <div className="grid grid-cols-1 gap-2">
                {category.items.map((item) => (
                  <PaletteItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
          
          <CanvasStats items={canvasItems} />
          <ExportImportPanel 
            onImport={setCanvasItems} 
            onClear={handleClearCanvas}
            onSearch={handleSearch}
          />

          {/* Zoom kontrolleri */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Yakınlaştırma</h3>
              <button 
                onClick={handleZoomReset}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sıfırla
              </button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 
                         text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                disabled={zoom <= 0.3}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" 
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <input
                type="range"
                min={0.3}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg accent-primary bg-gray-100 cursor-pointer"
                style={{ maxWidth: "calc(100% - 70px)" }}
              />

              <button
                onClick={handleZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 
                         text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                disabled={zoom >= 3}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" 
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <div className="mt-2 text-center">
              <span className="text-sm font-medium text-gray-600">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="w-full h-full" onClick={handleCanvasClick}>
            <A4Canvas
              zoom={zoom}
              items={canvasItems.map((item, index) => ({
                ...item,
                isSelected: index === selectedItemIndex,
                ResizeHandles: index === selectedItemIndex ? (
                  <ResizeHandles 
                    index={index} 
                    onResizeStart={handleResizeStart}
                  />
                ) : null,
                onDelete: (index: number) => {
                  console.log('Silme işlevi çağrıldı, silinecek index:', index);
                  setCanvasItems((prev) => {
                    console.log('Mevcut öğeler:', prev);
                    const newItems = prev.filter((_, i) => i !== index);
                    console.log('Filtrelenmiş öğeler:', newItems);
                    return newItems;
                  });
                  setSelectedItemIndex(null);
                },
                setSelectedItemIndex: setSelectedItemIndex,
                onDuplicate: (index: number) => {
                  setCanvasItems((prev) => {
                    const itemToDuplicate = prev[index];
                    const newItem = {
                      ...itemToDuplicate,
                      id: `${itemToDuplicate.id}-copy`,
                      position: {
                        x: itemToDuplicate.position.x + 20,
                        y: itemToDuplicate.position.y + 20
                      }
                    };
                    return [...prev, newItem];
                  });
                },
                onMoveForward: (index: number) => {
                  setCanvasItems((prev) => {
                    const newItems = [...prev];
                    if (index < newItems.length - 1) {
                      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    }
                    return newItems;
                  });
                },
                onMoveBackward: (index: number) => {
                  setCanvasItems((prev) => {
                    const newItems = [...prev];
                    if (index > 0) {
                      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                    }
                    return newItems;
                  });
                }
              }))}
            />
          </div>
          
        </div>

        <SimilarTemplatesPanel 
          templates={similarTemplates} 
          onClose={() => setSimilarTemplates([])} 
        />
      </div>

      <DragOverlay
        dropAnimation={null}
        modifiers={[
          (args) => {
            const { transform } = args;
            return {
              ...transform,
              x: transform.x - (activeItem?.dragOffset?.x || 0),
              y: transform.y - (activeItem?.dragOffset?.y || 0),
            };
          }
        ]}
      >
        {activeItem && activeItem.id.toString().startsWith('palette-') && (
          <div 
            className="shadow-2xl"
            style={{ 
              opacity: 1,
              transform: 'scale(1.05)',
              transition: 'transform 100ms cubic-bezier(0.18, 0.67, 0.6, 1.22)'
            }}
          >
            <PaletteItem
              isDragOverlay={true}
              item={{
                id: activeItem.id,
                type: activeItem.type,
                label: activeItem.label || '',
                icon: activeItem.icon,
              }}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 