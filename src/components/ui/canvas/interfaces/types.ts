import { ReactNode } from 'react';

export interface PaletteItem {
  id: string;
  type: 'text' | 'title' | 'list' | 'table' | 'figure';
  icon: ReactNode;
  label: string;
}

export interface PaletteCategory {
  id: string;
  title: string;
  items: PaletteItem[];
}

export interface CanvasItem extends PaletteItem {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface BackendTemplatePosition {
  item: number[];
  above: number | null;
  right: number | null;
  left: number | null;
  below: number | null;
}

export interface BackendTemplate {
  class_counts: {
    [key: string]: number;
  };
  category_count: number;
  element_count: number;
  element_id: string;
  instances: Array<{
    [key: string]: number | BackendTemplatePosition;
  }>;
}

export interface ImportedTemplateElement {
  id: string;
  type: 'text' | 'title' | 'list' | 'table' | 'figure';
  position: {
    x: number;
    y: number;
  };
  relations: {
    above: string | null;
    below: string | null;
    left: string | null;
    right: string | null;
  };
}

export interface ResizeHandle {
  position: 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left';
  cursor: string;
}

export interface DetailedSimilarityScores {
  element_similarity: number;
  relational_similarity: number;
  positional_similarity: number;
  logical_similarity: number;
}

export interface SimilarTemplate {
  image_url?: string
  json_content: {
    text_count: number
    title_count: number
    list_count: number
    table_count: number
    figure_count: number
  }
}

export interface TemplateSearchCounts {
  text_count: number;
  title_count: number;
  list_count: number;
  table_count: number;
  figure_count: number;
}

export interface BackendResponse {
  images: Array<{
    json_file: string;
    image_url: string;
    similarity_score: number;
    detailed_scores: DetailedSimilarityScores;
    json_content: {
      text_count: number;
      title_count: number;
      list_count: number;
      table_count: number;
      figure_count: number;
    };
  }>;
} 