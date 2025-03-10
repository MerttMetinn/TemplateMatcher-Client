'use client';

import { CanvasItem } from '../interfaces/types';
import { Text, Heading, List, Table, Image } from 'lucide-react';

interface CanvasStatsProps {
  items: CanvasItem[];
}

export function CanvasStats({ items }: CanvasStatsProps) {
  const stats = {
    text: items.filter(item => item.type === 'text').length,
    title: items.filter(item => item.type === 'title').length,
    list: items.filter(item => item.type === 'list').length,
    table: items.filter(item => item.type === 'table').length,
    figure: items.filter(item => item.type === 'figure').length,
  };

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <h4 className="text-xs font-medium text-gray-500 mb-2">İstatistikler</h4>
      <div className="grid grid-cols-1 gap-2 text-xs">
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <Text className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 font-medium">Text</span>
          <span className="ml-auto text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">{stats.text}</span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <Heading className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 font-medium">Title</span>
          <span className="ml-auto text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">{stats.title}</span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <List className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 font-medium">List</span>
          <span className="ml-auto text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">{stats.list}</span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <Table className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 font-medium">Table</span>
          <span className="ml-auto text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">{stats.table}</span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50">
            <Image className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-gray-600 font-medium">Figure</span>
          <span className="ml-auto text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">{stats.figure}</span>
        </div>
      </div>
    </div>
  );
} 