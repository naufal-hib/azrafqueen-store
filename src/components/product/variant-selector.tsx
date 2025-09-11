// src/components/product/variant-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
  additionalPrice: number
  sku?: string
  isActive: boolean
}

interface VariantSelectorProps {
  variants: ProductVariant[]
  basePrice: number
  onVariantChange: (variant: ProductVariant | null, finalPrice: number) => void
  className?: string
}

export function VariantSelector({ 
  variants, 
  basePrice, 
  onVariantChange,
  className 
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  // Group variants by type
  const sizes = Array.from(new Set(
    variants
      .filter(v => v.size && v.isActive)
      .map(v => v.size!)
  ))
  
  const colors = Array.from(new Set(
    variants
      .filter(v => v.color && v.isActive)
      .map(v => v.color!)
  ))

  // Get available variants based on current selection
  const getAvailableVariants = (filterBy: 'size' | 'color', value: string) => {
    return variants.filter(variant => {
      if (!variant.isActive) return false
      
      if (filterBy === 'size') {
        return variant.size === value && (!selectedVariant?.color || variant.color === selectedVariant.color)
      } else {
        return variant.color === value && (!selectedVariant?.size || variant.size === selectedVariant.size)
      }
    })
  }

  // Find exact variant match
  const findExactVariant = (size?: string, color?: string) => {
    return variants.find(variant => 
      variant.isActive &&
      variant.size === size &&
      variant.color === color
    )
  }

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    const availableColors = colors.filter(color => 
      getAvailableVariants('color', color).length > 0
    )

    let newVariant: ProductVariant | null = null

    if (selectedVariant?.color && availableColors.includes(selectedVariant.color)) {
      // Keep current color if available
      newVariant = findExactVariant(size, selectedVariant.color) || null
    } else if (availableColors.length > 0) {
      // Select first available color
      newVariant = findExactVariant(size, availableColors[0]) || null
    } else {
      // No colors available, find size-only variant
      newVariant = variants.find(v => v.isActive && v.size === size && !v.color) || null
    }

    setSelectedVariant(newVariant)
  }

  // Handle color selection
  const handleColorSelect = (color: string) => {
    const availableSizes = sizes.filter(size => 
      getAvailableVariants('size', size).length > 0
    )

    let newVariant: ProductVariant | null = null

    if (selectedVariant?.size && availableSizes.includes(selectedVariant.size)) {
      // Keep current size if available
      newVariant = findExactVariant(selectedVariant.size, color) || null
    } else if (availableSizes.length > 0) {
      // Select first available size
      newVariant = findExactVariant(availableSizes[0], color) || null
    } else {
      // No sizes available, find color-only variant
      newVariant = variants.find(v => v.isActive && v.color === color && !v.size) || null
    }

    setSelectedVariant(newVariant)
  }

  // Calculate final price
  const finalPrice = selectedVariant 
    ? basePrice + selectedVariant.additionalPrice 
    : basePrice

  // Notify parent component when variant changes
  useEffect(() => {
    onVariantChange(selectedVariant, finalPrice)
  }, [selectedVariant, finalPrice, onVariantChange])

  // If no variants or all inactive, don't show selector
  if (variants.length === 0 || !variants.some(v => v.isActive)) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Size</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const availableVariants = getAvailableVariants('size', size)
              const isSelected = selectedVariant?.size === size
              const isAvailable = availableVariants.length > 0 && 
                availableVariants.some(v => v.stock > 0)
              const isOutOfStock = availableVariants.length > 0 && 
                availableVariants.every(v => v.stock === 0)

              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative",
                    isOutOfStock && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {size}
                  {isSelected && (
                    <Check className="h-3 w-3 ml-1" />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-muted-foreground rotate-45" />
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Color</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const availableVariants = getAvailableVariants('color', color)
              const isSelected = selectedVariant?.color === color
              const isAvailable = availableVariants.length > 0 && 
                availableVariants.some(v => v.stock > 0)
              const isOutOfStock = availableVariants.length > 0 && 
                availableVariants.every(v => v.stock === 0)

              return (
                <Button
                  key={color}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleColorSelect(color)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative",
                    isOutOfStock && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {color}
                  {isSelected && (
                    <Check className="h-3 w-3 ml-1" />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-muted-foreground rotate-45" />
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selected:</span>
            <Badge variant="secondary">
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedVariant.size && <span>Size: {selectedVariant.size}</span>}
            {selectedVariant.size && selectedVariant.color && <span> • </span>}
            {selectedVariant.color && <span>Color: {selectedVariant.color}</span>}
          </div>
          
          {selectedVariant.additionalPrice > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Additional: </span>
              <span className="font-medium">+{formatCurrency(selectedVariant.additionalPrice)}</span>
            </div>
          )}
          
          <div className="text-lg font-semibold">
            Total: {formatCurrency(finalPrice)}
          </div>

          {selectedVariant.sku && (
            <div className="text-xs text-muted-foreground">
              SKU: {selectedVariant.sku}
            </div>
          )}
        </div>
      )}

      {/* No Variant Selected Message */}
      {(sizes.length > 0 || colors.length > 0) && !selectedVariant && (
        <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
          Please select {sizes.length > 0 ? 'size' : ''}{sizes.length > 0 && colors.length > 0 ? ' and ' : ''}{colors.length > 0 ? 'color' : ''} to continue
        </div>
      )}
    </div>
  )
}