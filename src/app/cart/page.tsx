"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCartStore, type CartItem, type CartSummary } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartSummary 
  } = useCartStore()
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const cartSummary = getCartSummary()

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setIsUpdating(itemId)
    updateQuantity(itemId, newQuantity)
    
    // Small delay for better UX
    setTimeout(() => setIsUpdating(null), 300)
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="outline" asChild>
            <Link href="/category">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          <EmptyCartState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Cart Items ({cartSummary.totalItems})
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive/80"
                >
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    isUpdating={isUpdating === item.id}
                    onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummaryCard cartSummary={cartSummary} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

// Empty Cart State Component
function EmptyCartState() {
  return (
    <div className="text-center py-16">
      <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
      <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Looks like you haven't added any items to your cart yet. 
        Start shopping to fill it up!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild>
          <Link href="/category">
            Browse Products
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Cart Item Card Component
interface CartItemCardProps {
  item: CartItem
  isUpdating: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

function CartItemCard({ item, isUpdating, onQuantityChange, onRemove }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, newQuantity)
    setQuantity(clampedQuantity)
    onQuantityChange(clampedQuantity)
  }

  const unitPrice = item.basePrice + (item.variant?.additionalPrice || 0)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {item.productImage ? (
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">
                  <Link 
                    href={`/product/${item.productSlug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {item.productName}
                  </Link>
                </h3>
                
                {/* Variant Info */}
                {item.variant && (
                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                    {item.variant.size && (
                      <Badge variant="outline" className="text-xs">
                        Size: {item.variant.size}
                      </Badge>
                    )}
                    {item.variant.color && (
                      <Badge variant="outline" className="text-xs">
                        Color: {item.variant.color}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                {formatCurrency(unitPrice)}
                {item.variant?.additionalPrice && item.variant.additionalPrice > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (+{formatCurrency(item.variant.additionalPrice)})
                  </span>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={isUpdating || quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center h-8"
                  min={1}
                  disabled={isUpdating}
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isUpdating}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Cart Summary Card Component
interface CartSummaryCardProps {
  cartSummary: CartSummary
}

function CartSummaryCard({ cartSummary }: CartSummaryCardProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({cartSummary.totalItems} items)</span>
            <span>{formatCurrency(cartSummary.subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {cartSummary.shipping === 0 ? (
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              ) : (
                formatCurrency(cartSummary.shipping)
              )}
            </span>
          </div>
          
          {cartSummary.shipping === 0 && cartSummary.subtotal >= 250000 && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              🎉 You get free shipping!
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(cartSummary.total)}</span>
        </div>

        <div className="space-y-3 pt-4">
          <Button className="w-full" size="lg" asChild>
            <Link href="/checkout">
              Proceed to Checkout
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/category">
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Free Shipping Progress */}
        {cartSummary.shipping > 0 && cartSummary.subtotal < 250000 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Add {formatCurrency(250000 - cartSummary.subtotal)} more for free shipping
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(cartSummary.subtotal / 250000) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}