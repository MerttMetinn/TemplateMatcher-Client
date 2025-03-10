import { CSSProperties } from 'react';

export function getFontSize(width: number, height: number): number {
  const minSize = Math.min(width, height);
  const baseFontSize = minSize * 0.25; // Boyutun %25'i kadar font
  return Math.min(Math.max(baseFontSize, 6), 12); // 6px ile 12px arası sınırla
}

export function getIconSize(width: number, height: number): number {
  const minSize = Math.min(width, height);
  const baseIconSize = minSize * 0.3; // Boyutun %30'u kadar icon
  return Math.min(Math.max(baseIconSize, 8), 14); // 8px ile 14px arası sınırla
}

export function getPadding(width: number, height: number): number {
  const minSize = Math.min(width, height);
  return Math.max(minSize * 0.05, 2); // Minimum 2px padding
}

export function getHandlePosition(position: string): CSSProperties {
  switch (position) {
    case 'top-left': return { top: '0%', left: '0%' };
    case 'top': return { top: '0%', left: '50%' };
    case 'top-right': return { top: '0%', left: '100%' };
    case 'right': return { top: '50%', left: '100%' };
    case 'bottom-right': return { top: '100%', left: '100%' };
    case 'bottom': return { top: '100%', left: '50%' };
    case 'bottom-left': return { top: '100%', left: '0%' };
    case 'left': return { top: '50%', left: '0%' };
    default: return {};
  }
} 