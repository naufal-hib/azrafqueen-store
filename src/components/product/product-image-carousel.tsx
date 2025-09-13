"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductImageCarouselProps {
  images: string[]
  productName: string
  productSlug: string
  className?: string
  autoSlideInterval?: number // in milliseconds, default 4000 (4 seconds)
}

// Helper function to format image URL
const formatProductImageUrl = (image: string): string => {
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

export function ProductImageCarousel({
  images,
  productName,
  productSlug,
  className,
  autoSlideInterval = 4000
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Format all images
  const formattedImages = images.length > 0 
    ? images.map(formatProductImageUrl)
    : ['/images/placeholder-product.svg']

  // Only show navigation if there are multiple images
  const hasMultipleImages = formattedImages.length > 1

  // Auto-slide functionality
  useEffect(() => {
    if (!hasMultipleImages || !isAutoPlaying || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === formattedImages.length - 1 ? 0 : prevIndex + 1
      )
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [formattedImages.length, hasMultipleImages, isAutoPlaying, isHovered, autoSlideInterval])

  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? formattedImages.length - 1 : prevIndex - 1
    )
  }, [formattedImages.length])

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === formattedImages.length - 1 ? 0 : prevIndex + 1
    )
  }, [formattedImages.length])

  const goToSlide = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }, [])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (hasMultipleImages) {
      if (isLeftSwipe) {
        const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent
        goToNext(fakeEvent)
      } else if (isRightSwipe) {
        const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent
        goToPrevious(fakeEvent)
      }
    }
  }

  return (
    <div 
      className={cn("relative w-full h-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Link href={`/product/${productSlug}`} className="block w-full h-full">
        <div className="relative w-full h-full">
          <Image
            src={formattedImages[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              if (target.src !== '/images/placeholder-product.svg') {
                target.src = '/images/placeholder-product.svg'
              }
            }}
          />
        </div>
      </Link>

      {/* Navigation Arrows - Only show if multiple images */}
      {hasMultipleImages && (
        <>
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className={cn(
              "absolute left-0.5 sm:left-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 bg-black/50 hover:bg-black/70 text-white transition-all duration-200",
              "opacity-50 sm:opacity-70",
              isHovered && "opacity-100 scale-110"
            )}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Previous image</span>
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className={cn(
              "absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 bg-black/50 hover:bg-black/70 text-white transition-all duration-200",
              "opacity-50 sm:opacity-70",
              isHovered && "opacity-100 scale-110"
            )}
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Next image</span>
          </Button>

          {/* Image Dots Indicator */}
          <div className={cn(
            "absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 transition-opacity duration-200",
            "opacity-60 sm:opacity-40",
            isHovered && "opacity-100"
          )}>
            {formattedImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-white scale-110" 
                    : "bg-white/50 hover:bg-white/75"
                )}
              >
                <span className="sr-only">Go to image {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Image Counter - Only show if multiple images */}
      {hasMultipleImages && (
        <div className={cn(
          "absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded transition-opacity duration-200",
          "opacity-60 sm:opacity-40",
          isHovered && "opacity-100"
        )}>
          {currentIndex + 1} / {formattedImages.length}
        </div>
      )}
    </div>
  )
}