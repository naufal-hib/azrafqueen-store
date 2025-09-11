// src/components/cart/cart-drawer.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    updateQuantity, 
    removeItem, 
    getCartSummary 
  } = useCartStore()
  
  const cartSummary = getCartSummary()

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cartSummary.totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add some products to get started
                </p>
                <Button asChild onClick={() => setCartOpen(false)}>
                  <Link href="/category">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && (
            <>
              <Separator />
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>{formatCurrency(cartSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {cartSummary.shipping === 0 ? (
                        <Badge variant="secondary" className="text-xs">FREE</Badge>
                      ) : (
                        formatCurrency(cartSummary.shipping)
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(cartSummary.total)}</span>
                  </div>
                  {cartSummary.shipping === 0 && cartSummary.subtotal >= 250000 && (
                    <p className="text-xs text-green-600">
                      🎉 You get free shipping!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout" onClick={() => setCartOpen(false)}>
                      Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/cart" onClick={() => setCartOpen(false)}>
                      View Cart
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Cart Item Component
interface CartItemProps {
  item: CartItem // Properly typed CartItem from store
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    setIsUpdating(true)
    onUpdateQuantity(item.id, newQuantity)
    
    // Small delay for better UX
    setTimeout(() => setIsUpdating(false), 200)
  }

  return (
    <div className="flex gap-3 py-3">
      {/* Product Image */}
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-medium line-clamp-2">
          <Link 
            href={`/product/${item.productSlug}`}
            className="hover:text-primary transition-colors"
          >
            {item.productName}
          </Link>
        </h4>
        
        {/* Variant Info */}
        {item.variant && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {item.variant.size && <span>Size: {item.variant.size}</span>}
            {item.variant.color && <span>Color: {item.variant.color}</span>}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {formatCurrency(item.basePrice + (item.variant?.additionalPrice || 0))}
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Subtotal & Remove */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold">
            {formatCurrency(item.subtotal)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}