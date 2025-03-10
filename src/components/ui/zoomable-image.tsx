"use client"

import { type ImgHTMLAttributes } from "react"
import Zoom from "react-medium-image-zoom"
import { cn } from "@/lib/utils"

export interface ImageZoomProps extends ImgHTMLAttributes<HTMLImageElement> {
  zoomInProps?: ImgHTMLAttributes<HTMLImageElement>
  className?: string
}

export function ImageZoom({
  className,
  children,
  alt,
  ...props
}: ImageZoomProps) {
  return (
    <Zoom
      zoomMargin={40}
      {...props}
    >
      {children ?? (
        <img
          className={cn(
            "cursor-zoom-in rounded-md transition-all",
            className
          )}
          alt={alt}
          {...props}
        />
      )}
    </Zoom>
  )
} 