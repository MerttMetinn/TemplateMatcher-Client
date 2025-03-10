"use client";

import type React from "react";

import type { SimilarTemplate } from "../interfaces/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { ImageZoom } from "@/components/ui/zoomable-image";
import { paletteItems } from "../utils/constants";

interface SimilarTemplatesPanelProps {
  templates: SimilarTemplate[];
  onClose: () => void;
}

interface ClassCounts {
  class_counts?: {
    [key: string]: number;
  };
  [key: string]: number | { [key: string]: number } | undefined;
}

// Veri dönüşümü için yardımcı fonksiyon
function transformJsonContent(content: ClassCounts) {
  // class_counts içindeki değerleri al
  const counts = content.class_counts || content;

  const transformed = {
    text_count: Number(counts["0_element"]) || 0,
    title_count: Number(counts["1_element"]) || 0,
    list_count: Number(counts["2_element"]) || 0,
    table_count: Number(counts["3_element"]) || 0,
    figure_count: Number(counts["4_element"]) || 0,
  };

  return transformed;
}

export function SimilarTemplatesPanel({
  templates,
  onClose,
}: SimilarTemplatesPanelProps) {
  if (templates.length === 0) return null;

  return (
    <div className="w-80 shrink-0 bg-card rounded-xl border shadow-md overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-muted/50">
        <h3 className="font-semibold text-sm">Benzer Şablonlar</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Kapat</span>
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {templates.map((template, index) => {
            const transformedContent = transformJsonContent(
              template.json_content
            );
            return (
              <div
                key={index}
                className="group rounded-lg overflow-hidden border bg-background hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-[350px] overflow-hidden bg-gray-50">
                  {template.image_url && (
                    <ImageZoom
                      src={template.image_url}
                      alt={`Benzer şablon ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <h4 className="font-medium text-sm truncate">
                    Şablon {index + 1}
                  </h4>

                  <div className="grid grid-cols-5 gap-1">
                    <TemplateStatItem
                      icon={paletteItems.find(item => item.type === 'text')?.icon}
                      label="Text"
                      value={transformedContent.text_count}
                    />
                    <TemplateStatItem
                      icon={paletteItems.find(item => item.type === 'title')?.icon}
                      label="Title"
                      value={transformedContent.title_count}
                    />
                    <TemplateStatItem
                      icon={paletteItems.find(item => item.type === 'list')?.icon}
                      label="List"
                      value={transformedContent.list_count}
                    />
                    <TemplateStatItem
                      icon={paletteItems.find(item => item.type === 'table')?.icon}
                      label="Table"
                      value={transformedContent.table_count}
                    />
                    <TemplateStatItem
                      icon={paletteItems.find(item => item.type === 'figure')?.icon}
                      label="Figure"
                      value={transformedContent.figure_count}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

interface TemplateStatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function TemplateStatItem({
  icon,
  label,
  value,
  ...props
}: TemplateStatItemProps) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-1 hover:bg-muted/70 transition-colors"
      {...props}
    >
      <div className="flex items-center justify-center gap-0.5">
        <div className="w-3 h-3 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-medium">{value}</span>
      </div>
      <span className="text-[8px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
