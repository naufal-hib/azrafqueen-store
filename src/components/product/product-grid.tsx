import { ProductCard } from "./product-card"
import { ProductGridSkeleton } from "@/components/layout/loading"

interface Product {
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

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function ProductGrid({ 
  products, 
  isLoading = false,
  emptyMessage = "No products found",
  className = ""
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
        <p className="text-muted-foreground max-w-md">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          discountPrice={product.discountPrice || undefined}
          images={product.images}
          category={product.category}
          isFeatured={product.isFeatured}
          stock={product.stock}
        />
      ))}
    </div>
  )
}