import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useWishlistStore } from "@/store/wishlist-store"
import { cn } from "@/lib/utils"
import { ProductImageCarousel } from "./product-image-carousel"

// Helper function to validate image URLs
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

interface ProductVariant {
  id: string
  size?: string | null
  color?: string | null
  stock: number
  additionalPrice: number
}

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  images: string[]
  category: {
    name: string
    slug: string
  }
  isFeatured?: boolean
  stock: number
  variants?: ProductVariant[]
}

// Helper function to format image URL for ProductCard
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

export function ProductCard({
  id,
  name,
  slug,
  price,
  discountPrice,
  images,
  category,
  isFeatured = false,
  stock,
  variants = []
}: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(id)
  
  const hasDiscount = discountPrice && discountPrice < price
  const finalPrice = hasDiscount ? discountPrice : price
  
  // Format the first image URL
  const primaryImageUrl = images[0] ? formatProductImageUrl(images[0]) : '/images/placeholder-product.svg'
  const discountPercentage = hasDiscount 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0

  const isOutOfStock = stock === 0
  
  // Calculate variant info
  const hasVariants = variants.length > 0
  const availableColors = hasVariants 
    ? Array.from(new Set(variants.filter(v => v.color).map(v => v.color))).length
    : 0
  const availableSizes = hasVariants 
    ? Array.from(new Set(variants.filter(v => v.size).map(v => v.size))).length
    : 0
  const priceRange = hasVariants 
    ? variants.reduce((range, variant) => {
        const variantPrice = price + variant.additionalPrice
        return {
          min: Math.min(range.min, variantPrice),
          max: Math.max(range.max, variantPrice)
        }
      }, { min: price, max: price })
    : null

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toggleItem({
      productId: id,
      productName: name,
      productSlug: slug,
      productImage: primaryImageUrl,
      basePrice: price,
      discountPrice,
      category
    })
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Product Image Carousel */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImageCarousel
          images={images}
          productName={name}
          productSlug={slug}
          autoSlideInterval={5000} // 5 seconds - not too fast
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-xs">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300",
            isWishlisted && "opacity-100 bg-red-50 hover:bg-red-100"
          )}
        >
          <Heart className={cn(
            "h-4 w-4 transition-colors",
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
          )} />
          <span className="sr-only">
            {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          </span>
        </Button>

        {/* Quick View/Details - Desktop Only */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <Button 
            className="w-full bg-white/90 text-black hover:bg-white border border-primary/20" 
            size="sm"
            disabled={isOutOfStock}
            asChild
          >
            <Link href={`/product/${slug}`}>
              {isOutOfStock ? 'Out of Stock' : 'Lihat Detail'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-2 sm:p-4">
        <div className="space-y-1 sm:space-y-2">
          {/* Category - Hidden on very small screens */}
          <Link 
            href={`/products?category=${category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors hidden sm:block"
          >
            {category.name}
          </Link>

          {/* Product Name */}
          <Link href={`/product/${slug}`}>
            <h3 className="font-medium text-xs sm:text-sm leading-tight hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[2.25rem]">
              {name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-sm sm:text-lg">
              {hasVariants && priceRange && priceRange.min !== priceRange.max 
                ? `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`
                : formatCurrency(finalPrice)
              }
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Stock Info - Hidden on mobile for space */}
          <div className="hidden sm:flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isOutOfStock ? 'Out of stock' : `${stock} in stock`}
            </span>
          </div>

          {/* Variants Info - Simplified on mobile */}
          {hasVariants && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {availableSizes > 0 && (
                <span className="hidden sm:inline">{availableSizes} size{availableSizes > 1 ? 's' : ''}</span>
              )}
              {availableSizes > 0 && availableColors > 0 && <span className="hidden sm:inline">•</span>}
              {availableColors > 0 && (
                <span className="hidden sm:inline">{availableColors} color{availableColors > 1 ? 's' : ''}</span>
              )}
              {/* Mobile: Show only if variants exist */}
              <span className="sm:hidden text-xs text-muted-foreground">
                {(availableSizes > 0 || availableColors > 0) ? 'Options available' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Mobile View Details - Simplified */}
      <CardFooter className="p-2 pt-0 sm:hidden">
        <Button 
          className="w-full text-xs" 
          size="sm"
          disabled={isOutOfStock}
          asChild
        >
          <Link href={`/product/${slug}`}>
            {isOutOfStock ? 'Sold Out' : 'Detail'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}