'use client';

import { useRef } from 'react';
import { Upload, Search, Trash2, Download } from 'lucide-react';
import { CanvasItem, BackendTemplate, ImportedTemplateElement, BackendTemplatePosition } from '../interfaces/types';
import { paletteItems } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

interface ExportImportPanelProps {
  onImport: (items: CanvasItem[]) => void;
  onClear: () => void;
  onSearch: () => void;
}

export function ExportImportPanel({ onImport, onClear, onSearch }: ExportImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tuvali temizleme işlemi için SweetAlert2 ile onay kontrolü
  const handleClearWithConfirmation = () => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Tuvali temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, temizle!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        onClear();
      }
    });
  };

  const convertBackendTemplateToCanvasItems = (template: BackendTemplate): CanvasItem[] => {
    return template.instances.map((instance, index) => {
      const classKey = `class_${index + 1}`;
      const positionKey = `relative_position_${index + 1}`;
      
      const classType = instance[classKey] as number;
      const positionData = instance[positionKey] as BackendTemplatePosition;
      
      if (!positionData?.item) {
        console.error('Position data not found for instance:', index + 1);
        return null;
      }

      const [left, top, right, bottom] = positionData.item;

      // Doğrudan koordinatları kullan
      const position = {
        x: left,
        y: top
      };

      const size = {
        width: right - left,
        height: bottom - top
      };

      // Debug: Her elementin pozisyonlarını logla
      console.log(`Element ${index + 1} (${classType}):`, {
        original: positionData.item,
        converted: {
          position,
          size
        }
      });
      
      const typeMap: { [key: number]: CanvasItem['type'] } = {
        0: 'text',
        1: 'title',
        2: 'list',
        3: 'table',
        4: 'figure'
      };

      const type = typeMap[classType];
      const paletteItem = paletteItems.find(item => item.type === type);
      
      if (!paletteItem) {
        console.error(`Palette item not found for type: ${type}`);
        return null;
      }

      return {
        ...paletteItem,
        position,
        size
      };
    }).filter((item): item is CanvasItem => item !== null);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.class_counts) {
          // Backend formatı
          const canvasItems = convertBackendTemplateToCanvasItems(data);
          onImport(canvasItems);
        } else if (data.version && data.template) {
          // Frontend formatı
          onImport(data.template.elements.map((element: ImportedTemplateElement) => ({
            ...paletteItems.find(item => item.type === element.type)!,
            position: element.position,
          })));
        } else {
          alert("Geçersiz template dosyası");
        }
      } catch (error) {
        console.error('Import error:', error);
        alert("Dosya okunamadı");
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    try {
      const canvasItems = document.querySelectorAll('[data-canvas-item]');
      if (canvasItems.length === 0) {
        alert('Dışa aktarılacak öğe bulunamadı.');
        return;
      }

      // Öğeleri topla
      const items: CanvasItem[] = [];
      canvasItems.forEach((item) => {
        const index = item.getAttribute('data-canvas-item');
        if (index) {
          try {
            const itemData = JSON.parse(item.getAttribute('data-item-json') || '{}');
            if (Object.keys(itemData).length > 0) {
              items.push(itemData);
            }
          } catch (error) {
            console.error('Öğe verisi ayrıştırılırken hata:', error);
          }
        }
      });

      // Merkez noktası hesaplama fonksiyonu
      const calculateCenter = (item: { position: { x: number; y: number }; size: { width: number; height: number } }) => {
        const centerX = item.position.x + item.size.width / 2;
        const centerY = item.position.y + item.size.height / 2;
        return [centerX, centerY];
      };

      // Yatay örtüşme kontrolü - Python'daki horizontal_double_roasted fonksiyonuna göre
      const horizontalOverlap = (item1: CanvasItem, item2: CanvasItem) => {
        const [item1CenterX] = calculateCenter(item1);
        const [item2CenterX] = calculateCenter(item2);
        
        const item1Left = item1.position.x;
        const item1Right = item1.position.x + item1.size.width;
        const item2Left = item2.position.x;
        const item2Right = item2.position.x + item2.size.width;
        
        return (item1Left < item2CenterX && item2CenterX < item1Right) || 
               (item2Left < item1CenterX && item1CenterX < item2Right);
      };

      // Dikey örtüşme kontrolü - Python'daki vertical_double_roasted fonksiyonuna göre
      const verticalOverlap = (item1: CanvasItem, item2: CanvasItem) => {
        const [, item1CenterY] = calculateCenter(item1);
        const [, item2CenterY] = calculateCenter(item2);
        
        const item1Top = item1.position.y;
        const item1Bottom = item1.position.y + item1.size.height;
        const item2Top = item2.position.y;
        const item2Bottom = item2.position.y + item2.size.height;
        
        return (item1Top < item2CenterY && item2CenterY < item1Bottom) || 
               (item2Top < item1CenterY && item1CenterY < item2Bottom);
      };

      // İlişkileri hesaplama fonksiyonları
      const findAbove = (currentItem: CanvasItem, allItems: CanvasItem[]) => {
        const [, currentCenterY] = calculateCenter(currentItem);
        const candidates = allItems
          .filter(other => {
            if (other === currentItem) return false;
            const [, otherCenterY] = calculateCenter(other);
            return otherCenterY < currentCenterY && horizontalOverlap(currentItem, other);
          });

        if (candidates.length === 0) return null;
        
        return candidates.reduce((prev, current) => {
          const [, prevCenterY] = calculateCenter(prev);
          const [, currentCenterY] = calculateCenter(current);
          return currentCenterY > prevCenterY ? current : prev;
        });
      };

      const findRight = (currentItem: CanvasItem, allItems: CanvasItem[]) => {
        const [currentCenterX] = calculateCenter(currentItem);
        const candidates = allItems
          .filter(other => {
            if (other === currentItem) return false;
            const [otherCenterX] = calculateCenter(other);
            return otherCenterX > currentCenterX && verticalOverlap(currentItem, other);
          });

        if (candidates.length === 0) return null;

        return candidates.reduce((prev, current) => {
          const [prevCenterX] = calculateCenter(prev);
          const [currentCenterX] = calculateCenter(current);
          return currentCenterX < prevCenterX ? current : prev;
        });
      };

      const findLeft = (currentItem: CanvasItem, allItems: CanvasItem[]) => {
        const [currentCenterX] = calculateCenter(currentItem);
        const candidates = allItems
          .filter(other => {
            if (other === currentItem) return false;
            const [otherCenterX] = calculateCenter(other);
            return otherCenterX < currentCenterX && verticalOverlap(currentItem, other);
          });

        if (candidates.length === 0) return null;

        return candidates.reduce((prev, current) => {
          const [prevCenterX] = calculateCenter(prev);
          const [currentCenterX] = calculateCenter(current);
          return currentCenterX > prevCenterX ? current : prev;
        });
      };

      const findBelow = (currentItem: CanvasItem, allItems: CanvasItem[]) => {
        const [, currentCenterY] = calculateCenter(currentItem);
        const candidates = allItems
          .filter(other => {
            if (other === currentItem) return false;
            const [, otherCenterY] = calculateCenter(other);
            return otherCenterY > currentCenterY && horizontalOverlap(currentItem, other);
          });

        if (candidates.length === 0) return null;

        return candidates.reduce((prev, current) => {
          const [, prevCenterY] = calculateCenter(prev);
          const [, currentCenterY] = calculateCenter(current);
          return currentCenterY < prevCenterY ? current : prev;
        });
      };

      // Öğe tipini sınıf numarasına dönüştürme
      const getClassNumber = (type: string): number => {
        if (type === 'text') return 0;
        if (type === 'title') return 1;
        if (type === 'list') return 2;
        if (type === 'table') return 3;
        if (type === 'figure') return 4;
        return 0;
      };

      // Instances dizisini oluştur
      const instances = items.map((item, idx) => {
        const instanceId = idx + 1;
        const classType = getClassNumber(item.type);

        const left = item.position.x;
        const top = item.position.y;
        const right = left + item.size.width;
        const bottom = top + item.size.height;

        // İlişkileri hesapla
        const aboveItem = findAbove(item, items);
        const rightItem = findRight(item, items);
        const leftItem = findLeft(item, items);
        const belowItem = findBelow(item, items);

        const instance: Record<string, unknown> = {};
        instance[`instance_id_${instanceId}`] = instanceId;
        instance[`class_${instanceId}`] = classType;
        instance[`relative_position_${instanceId}`] = {
          item: [left, top, right, bottom],
          above: aboveItem ? getClassNumber(aboveItem.type) : null,
          right: rightItem ? getClassNumber(rightItem.type) : null,
          left: leftItem ? getClassNumber(leftItem.type) : null,
          below: belowItem ? getClassNumber(belowItem.type) : null
        };
        
        return instance;
      });

      // UUID oluşturma fonksiyonu
      const generateUniqueElementId = () => {
        return uuidv4().replace(/-/g, ''); // Tire işaretlerini kaldırarak hex formatına dönüştür
      };

      // Son JSON formatını oluştur
      const exportData = {
        class_counts: {
          "0_element": items.filter(item => item.type === 'text').length,
          "1_element": items.filter(item => item.type === 'title').length,
          "2_element": items.filter(item => item.type === 'list').length,
          "3_element": items.filter(item => item.type === 'table').length,
          "4_element": items.filter(item => item.type === 'figure').length
        },
        category_count: new Set(items.map(item => getClassNumber(item.type))).size,
        element_count: items.length,
        element_id: generateUniqueElementId(),
        instances
      };

      console.log('Dışa aktarılan veriler:', exportData);

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Dışa aktarma sırasında hata:', error);
      alert('Dışa aktarma sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <h4 className="text-xs font-medium text-gray-500 mb-1.5">Template İşlemleri</h4>
      
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-1 p-1.5 text-xs font-medium rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
        
        <label className="flex items-center justify-center gap-1 p-1.5 text-xs font-medium rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Arama butonu - tam genişlikte ve mavi */}
      <button
        onClick={onSearch}
        className="flex items-center justify-center gap-1 p-2 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white w-full mb-2"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Arama</span>
      </button>
      
      {/* Temizle butonu - tam genişlikte ve kırmızı, en altta */}
      <button
        onClick={handleClearWithConfirmation}
        className="flex items-center justify-center gap-1 p-2 text-xs font-medium rounded-md bg-red-500 hover:bg-red-600 text-white w-full"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Tuvali Temizle</span>
      </button>
    </div>
  );
}