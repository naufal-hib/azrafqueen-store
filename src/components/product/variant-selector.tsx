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
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

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
        return variant.size === value && (!selectedColor || variant.color === selectedColor)
      } else {
        return variant.color === value && (!selectedSize || variant.size === selectedSize)
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
    // Toggle selection if clicking the same size
    if (selectedSize === size) {
      setSelectedSize('')
      setSelectedVariant(null)
      return
    }
    
    setSelectedSize(size)
    
    // If there are colors available, wait for color selection
    if (colors.length > 0) {
      if (selectedColor) {
        const exactVariant = findExactVariant(size, selectedColor)
        setSelectedVariant(exactVariant || null)
      } else {
        // Colors exist but none selected yet
        setSelectedVariant(null)
      }
    } else {
      // No colors exist, this is a size-only product
      const sizeOnlyVariant = variants.find(v => 
        v.isActive && v.size === size && (!v.color || v.color === '')
      )
      setSelectedVariant(sizeOnlyVariant || null)
    }
  }

  // Handle color selection
  const handleColorSelect = (color: string) => {
    // Toggle selection if clicking the same color
    if (selectedColor === color) {
      setSelectedColor('')
      setSelectedVariant(null)
      return
    }
    
    setSelectedColor(color)
    
    // If there are sizes available, wait for size selection
    if (sizes.length > 0) {
      if (selectedSize) {
        const exactVariant = findExactVariant(selectedSize, color)
        setSelectedVariant(exactVariant || null)
      } else {
        // Sizes exist but none selected yet
        setSelectedVariant(null)
      }
    } else {
      // No sizes exist, this is a color-only product
      const colorOnlyVariant = variants.find(v => 
        v.isActive && v.color === color && (!v.size || v.size === '')
      )
      setSelectedVariant(colorOnlyVariant || null)
    }
  }

  // Calculate final price
  const finalPrice = selectedVariant 
    ? basePrice + selectedVariant.additionalPrice 
    : basePrice

  // Notify parent component when variant changes
  useEffect(() => {
    onVariantChange(selectedVariant, finalPrice)
  }, [selectedVariant, finalPrice, onVariantChange])

  // Reset selections when variants change
  useEffect(() => {
    setSelectedVariant(null)
    setSelectedSize('')
    setSelectedColor('')
  }, [variants])

  // Clear all selections
  const clearSelections = () => {
    setSelectedSize('')
    setSelectedColor('')
    setSelectedVariant(null)
  }

  // Check if any selection has been made
  const hasAnySelection = selectedSize || selectedColor

  // If no variants or all inactive, don't show selector
  if (variants.length === 0 || !variants.some(v => v.isActive)) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Clear Button */}
      {hasAnySelection && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedSize && `Size: ${selectedSize}`}
            {selectedSize && selectedColor && ' • '}
            {selectedColor && `Color: ${selectedColor}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelections}
            className="text-xs h-6 px-2"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Size</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const availableVariants = getAvailableVariants('size', size)
              const isSelected = selectedSize === size
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
              const isSelected = selectedColor === color
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
      {!selectedVariant && !hasAnySelection && (sizes.length > 0 || colors.length > 0) && (
        <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
          <p className="font-medium mb-1">Please select your options:</p>
          <p>
            {sizes.length > 0 && `Choose ${sizes.length > 1 ? `from ${sizes.length} sizes` : 'size'}`}
            {sizes.length > 0 && colors.length > 0 && ' and '}
            {colors.length > 0 && `choose ${colors.length > 1 ? `from ${colors.length} colors` : 'color'}`}
          </p>
        </div>
      )}

      {/* Incomplete Selection Message */}
      {!selectedVariant && hasAnySelection && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center text-sm text-amber-700">
          <p className="font-medium mb-1">Almost there!</p>
          <p>
            {selectedSize && !selectedColor && colors.length > 0 && 'Please select a color to continue'}
            {selectedColor && !selectedSize && sizes.length > 0 && 'Please select a size to continue'}
          </p>
        </div>
      )}
    </div>
  )
}