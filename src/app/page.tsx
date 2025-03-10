'use client';
import React, { useState, useEffect } from "react";
import { ImageUploadDemo } from "@/components/ui/image-upload";
import { 
  DndContext, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  pointerWithin,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { TemplateCreator } from "@/components/ui/canvas/template-creator";
import { motion } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { ImageZoom } from "@/components/ui/zoomable-image";
import toast, { Toaster } from 'react-hot-toast';

interface Result {
  image_url: string;
  json_content: {
    text_count?: number;
    title_count?: number;
    list_count?: number;
    table_count?: number;
    figure_count?: number;
    [key: string]: number | undefined;
  };
}

interface UploadResponse {
  images: Result[];
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    // Burada drag & drop işlemleri için gerekli mantığı ekleyebilirsiniz
    console.log('Drag ended:', { active, over });
  };

  const handleUploadComplete = (response: UploadResponse) => {
    if (response.images && response.images.length > 0) {
      setResults(response.images);
      setShowFileUpload(false);
      setShowTemplateCreator(false);
      toast.success(`${response.images.length} sonuç bulundu.`, {
        duration: 3000,
        position: 'top-right',
      });
    } else {
      toast.error('Benzer belge bulunamadı. Lütfen farklı bir dosya deneyin.', {
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

  const resetViews = () => {
    setShowFileUpload(false);
    setShowTemplateCreator(false);
    setResults([]);
  };

  // Client-side only rendering için
  if (!mounted) {
    return null;
  }

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
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
      
      <div className="min-h-screen w-full bg-background">
        {/* Üst Menü */}
        <div className="fixed top-0 left-0 right-0 p-4 z-50 flex justify-center">
          <div className="flex items-center gap-2 sm:gap-3 bg-background/95 border border-border backdrop-blur-lg py-1 px-1.5 rounded-full shadow-lg">
            <button
              onClick={() => {
                resetViews();
                setShowFileUpload(true);
              }}
              className={`relative cursor-pointer text-xs sm:text-sm font-semibold px-3 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                showFileUpload 
                ? 'bg-muted text-primary' 
                : 'text-foreground/80 hover:text-primary'
              }`}
            >
              <span className="hidden sm:inline">With adding file</span>
              <span className="sm:hidden">Add File</span>
              {showFileUpload && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
            <button
              onClick={() => {
                resetViews();
                setShowTemplateCreator(true);
              }}
              className={`relative cursor-pointer text-xs sm:text-sm font-semibold px-3 sm:px-6 py-2 rounded-full transition-all duration-200 ${
                showTemplateCreator 
                ? 'bg-muted text-primary' 
                : 'text-foreground/80 hover:text-primary'
              }`}
            >
              <span className="hidden sm:inline">With create new template</span>
              <span className="sm:hidden">New Template</span>
              {showTemplateCreator && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="w-full pt-16 sm:pt-20 pb-12 sm:pb-16 lg:pb-24 px-2 sm:px-4 lg:px-6">
          {(showFileUpload || showTemplateCreator) && (
            <div className={`mx-auto ${showTemplateCreator ? 'max-w-full' : 'max-w-7xl'} h-[calc(100vh-8rem)] flex items-center justify-center`}>
              {showFileUpload && <ImageUploadDemo onUploadComplete={handleUploadComplete} />}
              {showTemplateCreator && <TemplateCreator />}
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-4 sm:mt-6 max-w-7xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">Sonuçlar</h3>
              <AnimatedGroup 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 justify-items-center"
                preset="blur-slide"
              >
                {results.map((result, index) => (
                  <div key={index} className="w-full max-w-lg border rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="h-[250px] sm:h-[350px] lg:h-[500px] relative overflow-hidden">
                      <ImageZoom
                        src={result.image_url}
                        alt={`Image ${index}`}
                        className="w-full h-full object-contain bg-gray-50 p-2"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <pre className="text-xs bg-gray-50 p-2 sm:p-3 rounded-lg overflow-auto max-h-48 sm:max-h-64">
                        {JSON.stringify(result.json_content, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </AnimatedGroup>
            </div>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="p-3 rounded-lg border border-primary/20 bg-white shadow-lg">
            {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
