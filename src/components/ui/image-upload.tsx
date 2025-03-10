import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useImageUpload } from "@/components/hooks/use-image-upload"
import { ImagePlus, X, Upload, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/app/services/api"

interface UploadResponse {
  images: Array<{
    image_url: string;
    json_content: {
      text_count?: number;
      title_count?: number;
      list_count?: number;
      table_count?: number;
      figure_count?: number;
      [key: string]: number | undefined;
    };
  }>;
}

interface ImageUploadDemoProps {
  onUploadComplete?: (response: UploadResponse) => void;
}

export function ImageUploadDemo({ onUploadComplete }: ImageUploadDemoProps) {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url) => console.log("Selected image URL:", url),
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      alert("Lütfen bir dosya seçin");
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadFile(fileInputRef.current.files[0]);
      onUploadComplete?.(response);
      handleRemove();
    } catch (error) {
      console.error("Dosya yüklenirken hata oluştu:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const input = fileInputRef.current;
        if (input) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          handleFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
        }
      }
    },
    [fileInputRef, handleFileChange],
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-base sm:text-lg font-medium">Dosya Yükle</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Desteklenen formatlar: JPG, PNG, GIF
        </p>
      </div>

      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-48 sm:h-64 cursor-pointer flex-col items-center justify-center gap-3 sm:gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
            isDragging && "border-primary/50 bg-primary/5",
          )}
        >
          <div className="rounded-full bg-background p-2 sm:p-3 shadow-sm">
            <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-medium">Dosya seçmek için tıklayın</p>
            <p className="text-xs text-muted-foreground">
              veya buraya sürükleyip bırakın
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="group relative h-48 sm:h-64 overflow-hidden rounded-lg border">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleThumbnailClick}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="truncate">{fileName}</span>
                <button
                  onClick={handleRemove}
                  className="ml-auto rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            )}
          </div>
          <Button 
            onClick={handleUpload} 
            className="w-full h-9 sm:h-10 text-xs sm:text-sm"
            disabled={isUploading}
          >
            {isUploading ? "Yükleniyor..." : "Dosyayı Yükle"}
          </Button>
        </div>
      )}
    </div>
  )
} 