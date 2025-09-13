"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { useWishlistStore } from "@/store/wishlist-store"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)

  const handleRemoveItem = async (productId: string) => {
    setRemovingItemId(productId)
    // Add small delay for animation
    await new Promise(resolve => setTimeout(resolve, 200))
    removeItem(productId)
    setRemovingItemId(null)
  }

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist()
    }
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="h-24 w-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Your Wishlist is Empty</h1>
              <p className="text-muted-foreground">
                Save items you love to buy them later or share with friends.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/products" className="inline-flex items-center">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={handleClearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button asChild>
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 gap-6">
          {items.map((item) => (
            <Card 
              key={item.id}
              className={cn(
                "overflow-hidden transition-all duration-200",
                removingItemId === item.productId && "opacity-50 scale-95"
              )}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="relative aspect-square sm:w-48 sm:h-48 bg-muted flex-shrink-0">
                  <Link href={`/product/${item.productSlug}`}>
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 192px"
                    />
                  </Link>
                </div>

                {/* Product Details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between h-full">
                    <div className="space-y-3 flex-1">
                      {/* Category */}
                      <Link 
                        href={`/products?category=${item.category.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.category.name}
                      </Link>

                      {/* Product Name */}
                      <Link href={`/product/${item.productSlug}`}>
                        <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
                          {item.productName}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">
                          {formatCurrency(item.discountPrice || item.basePrice)}
                        </span>
                        {item.discountPrice && item.discountPrice < item.basePrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-muted-foreground line-through">
                              {formatCurrency(item.basePrice)}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              -{Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Date Added */}
                      <p className="text-sm text-muted-foreground">
                        Added on {new Date(item.dateAdded).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 sm:ml-6">
                      <Button asChild className="flex-1 sm:flex-none">
                        <Link 
                          href={`/product/${item.productSlug}`}
                          className="inline-flex items-center justify-center"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Product
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removingItemId === item.productId}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="sr-only">Remove from wishlist</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Share your wishlist with friends and family
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/products">
                Browse Categories
              </Link>
            </Button>
            <Button asChild>
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}