import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

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
}

export function ProductCard({
  // id, // Commented out as it's not used yet, will be needed for cart functionality
  name,
  slug,
  price,
  discountPrice,
  images,
  category,
  isFeatured = false,
  stock
}: ProductCardProps) {
  const hasDiscount = discountPrice && discountPrice < price
  const finalPrice = hasDiscount ? discountPrice : price
  const discountPercentage = hasDiscount 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0

  const isOutOfStock = stock === 0

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${slug}`}>
          <div className="relative w-full h-full">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No Image</span>
              </div>
            )}
          </div>
        </Link>

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
          className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>

        {/* Quick Add to Cart - Desktop Only */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
          <Button 
            className="w-full" 
            size="sm"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Category */}
          <Link 
            href={`/category/${category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {category.name}
          </Link>

          {/* Product Name */}
          <Link href={`/product/${slug}`}>
            <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {formatCurrency(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isOutOfStock ? 'Out of stock' : `${stock} in stock`}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Mobile Add to Cart */}
      <CardFooter className="p-4 pt-0 sm:hidden">
        <Button 
          className="w-full" 
          size="sm"
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}