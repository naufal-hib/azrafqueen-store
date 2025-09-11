// src/app/product/[slug]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  ChevronRight, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Heart,
  Share2 
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductImageGallery } from "@/components/product/product-image-gallery"
import { VariantSelector, ProductVariant } from "@/components/product/variant-selector"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { ProductGrid } from "@/components/product/product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { ErrorComponent } from "@/components/layout/error"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  slug: string
  stock: number
  weight?: number
  isActive: boolean
  isFeatured: boolean
  category: {
    id: string
    name: string
    slug: string
    description?: string
  }
  variants: ProductVariant[]
}

interface RelatedProduct {
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
  isFeatured: boolean
  stock: number
}

interface ProductDetailData {
  product: Product
  relatedProducts: RelatedProduct[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<ProductDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [finalPrice, setFinalPrice] = useState(0)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${slug}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Product not found')
        }

        setData(result.data)
        setFinalPrice(result.data.product.discountPrice || result.data.product.price)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  // Handle variant change
  const handleVariantChange = (variant: ProductVariant | null, price: number) => {
    setSelectedVariant(variant)
    setFinalPrice(price)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <ProductDetailSkeleton />
        </div>
      </MainLayout>
    )
  }

  if (error || !data) {
    return (
      <MainLayout>
        <ErrorComponent
          title="Product Not Found"
          message={error || "The product you're looking for doesn't exist."}
          showHomeButton={true}
          showRetryButton={true}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    )
  }

  const { product, relatedProducts } = data
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/category" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link 
            href={`/category/${product.category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category.name}</Badge>
                {product.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating Placeholder */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(24 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600">
                  You save {formatCurrency(product.price - product.discountPrice)}
                </p>
              )}
            </div>

            <Separator />

            {/* Variant Selection */}
            {product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                basePrice={product.discountPrice || product.price}
                onVariantChange={handleVariantChange}
              />
            )}

            {/* Add to Cart */}
            <AddToCartButton
              product={product}
              selectedVariant={selectedVariant}
              finalPrice={finalPrice}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Add to Wishlist
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Quality Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Product Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">SKU:</dt>
                      <dd>{product.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category:</dt>
                      <dd>{product.category.name}</dd>
                    </div>
                    {product.weight && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Weight:</dt>
                        <dd>{product.weight}g</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Stock:</dt>
                      <dd>{product.stock} available</dd>
                    </div>
                  </dl>
                </div>
                
                {product.variants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Available Variants</h4>
                    <div className="space-y-2 text-sm">
                      {product.variants.map((variant) => (
                        <div key={variant.id} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {variant.size && `${variant.size}`}
                            {variant.size && variant.color && ' - '}
                            {variant.color && `${variant.color}`}:
                          </span>
                          <span>{variant.stock} in stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Customer reviews will be displayed here in the future.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Button variant="outline" asChild>
                <Link href={`/category/${product.category.slug}`}>
                  View All
                </Link>
              </Button>
            </div>
            <ProductGrid
              products={relatedProducts}
              emptyMessage="No related products found"
            />
          </div>
        )}
      </div>
    </MainLayout>
  )
}

// Loading skeleton component
function ProductDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Product detail skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}