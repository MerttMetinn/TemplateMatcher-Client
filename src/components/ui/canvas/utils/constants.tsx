import { Text, Type, ListOrdered, Table2, Image } from 'lucide-react';
import { PaletteItem, ResizeHandle, PaletteCategory } from '../interfaces/types';

export const paletteCategories: PaletteCategory[] = [
  {
    id: 'text-elements',
    title: 'Metin Öğeleri',
    items: [
      { id: 'text', type: 'text', icon: <Text className="h-4 w-4" />, label: 'Text' },
      { id: 'title', type: 'title', icon: <Type className="h-4 w-4" />, label: 'Title' },
      { id: 'list', type: 'list', icon: <ListOrdered className="h-4 w-4" />, label: 'List' },
    ]
  },
  {
    id: 'visual-elements',
    title: 'Görsel Öğeleri',
    items: [
      { id: 'table', type: 'table', icon: <Table2 className="h-4 w-4" />, label: 'Table' },
      { id: 'figure', type: 'figure', icon: <Image className="h-4 w-4" />, label: 'Figure' },
    ]
  }
];

// Geriye dönük uyumluluk için düz liste
export const paletteItems: PaletteItem[] = paletteCategories.flatMap(category => category.items);

export const resizeHandles: ResizeHandle[] = [
  { position: 'top-left', cursor: 'nw-resize' },
  { position: 'top', cursor: 'n-resize' },
  { position: 'top-right', cursor: 'ne-resize' },
  { position: 'right', cursor: 'e-resize' },
  { position: 'bottom-right', cursor: 'se-resize' },
  { position: 'bottom', cursor: 's-resize' },
  { position: 'bottom-left', cursor: 'sw-resize' },
  { position: 'left', cursor: 'w-resize' },
];

export const MIN_WIDTH = 100;
export const MIN_HEIGHT = 40;

// A4 boyutları (piksel cinsinden)
export const A4_WIDTH = 612; // Orijinal genişlik
export const A4_HEIGHT = 792; // Orijinal yükseklik

// A4 boyutları (piksel cinsinden - yaklaşık olarak)
export const A4_WIDTH_APPROX = 397; // 210mm * 1.89 (yarı ölçek)
export const A4_HEIGHT_APPROX = 562; // 297mm * 1.89 (yarı ölçek) 