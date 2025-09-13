// src/components/product/product-image-gallery.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Helper function to validate and format image URLs
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  
  // Check if it's a relative path or absolute URL
  if (url.startsWith('/') || url.startsWith('http')) {
    return url.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico)(\?.*)?$/i) !== null
  }
  
  // For absolute URLs, try URL constructor
  try {
    new URL(url)
    return url.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico)(\?.*)?$/i) !== null
  } catch {
    return false
  }
}

const formatImageUrl = (image: string): string => {
  // If it's already a valid URL with protocol, return as is
  if (image?.startsWith('http')) {
    return image
  }
  
  // If it's already a valid relative path, return as is
  if (image?.startsWith('/')) {
    return image
  }
  
  // If it's just a filename, assume it's in the uploads folder
  if (image && typeof image === 'string' && image.includes('.')) {
    return `/uploads/${image}`
  }
  
  // Fallback to placeholder
  return '/images/placeholder-product.svg'
}

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function ProductImageGallery({ 
  images, 
  productName, 
  className 
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Process and format images with fallback
  const displayImages = images.length > 0 
    ? images.map(formatImageUrl)
    : ['/images/placeholder-product.svg']
  const currentImage = displayImages[currentImageIndex]

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={currentImage}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          priority
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = '/images/placeholder-product.svg'
          }}
        />
        
        {/* Navigation Arrows - Show only if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous image</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next image</span>
            </Button>
          </>
        )}

        {/* Expand Button for Zoom Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
            >
              <Expand className="h-4 w-4" />
              <span className="sr-only">View full size</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>{productName} - Full Size Image</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square w-full">
              <Image
                src={currentImage}
                alt={`${productName} - Full size`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-product.svg'
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Counter - Show only if multiple images */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images - Show only if multiple images */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-md border-2 transition-all",
                index === currentImageIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-product.svg'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}