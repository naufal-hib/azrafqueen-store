// src/components/product/add-to-cart-button.tsx
"use client"

import { useState } from "react"
import { ShoppingCart, Minus, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/store/cart-store"
import { ProductVariant } from "./variant-selector"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
}

interface AddToCartButtonProps {
  product: Product
  selectedVariant: ProductVariant | null
  hasVariants?: boolean // Whether product has variants available
  className?: string
}

export function AddToCartButton({ 
  product, 
  selectedVariant,
  hasVariants = false,
  className 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  
  const { addItem, toggleCart, getCartItem } = useCartStore()

  // Check if product (with variant) is already in cart
  const existingCartItem = getCartItem(product.id, selectedVariant?.id)

  // Calculate available stock
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock
  const maxQuantity = Math.max(1, availableStock)
  
  // Calculate current price based on variant
  const currentPrice = selectedVariant 
    ? product.price + selectedVariant.additionalPrice 
    : product.price
  
  // For products with variants, require variant selection
  const requiresVariantSelection = hasVariants && !selectedVariant
  
  // Check if product can be added to cart
  const canAddToCart = availableStock > 0 && quantity > 0 && quantity <= availableStock && !requiresVariantSelection
  
  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity))
    setQuantity(clampedQuantity)
  }

  const handleAddToCart = async () => {
    if (!canAddToCart) return

    setIsAdding(true)

    try {
      // Prepare cart item data
      const cartVariant = selectedVariant ? {
        id: selectedVariant.id,
        size: selectedVariant.size,
        color: selectedVariant.color,
        additionalPrice: selectedVariant.additionalPrice
      } : undefined

      // Add to cart
      addItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || '',
        basePrice: product.price,
        quantity,
        variant: cartVariant
      })

      // Show success feedback
      setJustAdded(true)
      
      // Auto-open cart drawer after a short delay
      setTimeout(() => {
        toggleCart()
      }, 500)

      // Reset success state
      setTimeout(() => {
        setJustAdded(false)
      }, 2000)

    } catch (error) {
      console.error('Error adding to cart:', error)
      // TODO: Show error toast/notification
    } finally {
      setIsAdding(false)
    }
  }

  // If out of stock
  if (availableStock <= 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Button size="lg" className="w-full" disabled>
          Out of Stock
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          This item is currently out of stock
        </p>
      </div>
    )
  }

  // If requires variant selection
  if (requiresVariantSelection) {
    return (
      <div className={cn("space-y-4", className)}>
        <Button size="lg" className="w-full" disabled>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Select Options
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Please select product options above
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Quantity
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min={1}
            max={maxQuantity}
            className="w-20 text-center"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground ml-2">
            {availableStock} available
          </span>
        </div>
      </div>

      {/* Current Price Display */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Unit Price:</span>
          <span className="font-medium">{formatCurrency(currentPrice)}</span>
        </div>
        <div className="flex justify-between items-center font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(currentPrice * quantity)}</span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button 
        size="lg" 
        className="w-full" 
        onClick={handleAddToCart}
        disabled={!canAddToCart || isAdding || justAdded}
      >
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Adding...
          </>
        ) : justAdded ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Already in Cart Info */}
      {existingCartItem && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <ShoppingCart className="h-4 w-4 inline mr-1" />
            {existingCartItem.quantity} already in cart
            {quantity > 1 && ` • Adding ${quantity} more`}
          </p>
        </div>
      )}

      {/* Stock Warning */}
      {availableStock <= 5 && availableStock > 0 && (
        <p className="text-sm text-orange-600 dark:text-orange-400 text-center">
          ⚠️ Only {availableStock} left in stock
        </p>
      )}
    </div>
  )
}