"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductFilters } from "@/components/product/product-filters"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ErrorComponent } from "@/components/layout/error"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

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

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

interface CategoryData {
  category: Category
  products: Product[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // Unwrap params Promise using React.use()
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  
  const searchParams = useSearchParams()
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Query parameters
  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''

  // Fetch category data with useCallback to fix useEffect dependency
  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        sort,
        ...(search && { search }),
      })

      const response = await fetch(`/api/categories/${slug}?${queryParams}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch category data')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [slug, page, sort, search])

  useEffect(() => {
    fetchCategoryData()
  }, [fetchCategoryData])

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sort', newSort)
    url.searchParams.set('page', '1') // Reset to first page
    window.history.pushState({}, '', url.toString())
    window.location.reload()
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', newPage.toString())
    window.history.pushState({}, '', url.toString())
    window.location.reload()
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorComponent
          title="Category Not Found"
          message={error}
          showHomeButton={true}
          showRetryButton={true}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/category" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {data?.category.name || 'Loading...'}
          </span>
        </nav>

        {/* Category Header */}
        {data?.category && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{data.category.name}</h1>
            {data.category.description && (
              <p className="text-muted-foreground text-lg">
                {data.category.description}
              </p>
            )}
          </div>
        )}

        <Separator className="mb-6" />

        {/* Filters */}
        {data && (
          <ProductFilters
            totalProducts={data.pagination.totalCount}
            currentSort={sort}
            onSortChange={handleSortChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        )}

        {/* Products Grid */}
        <div className="mt-6">
          <ProductGrid
            products={data?.products || []}
            isLoading={loading}
            emptyMessage={`No products found in ${data?.category.name || 'this category'}`}
          />
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(data.pagination.page - 1)}
              disabled={!data.pagination.hasPrev}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  const current = data.pagination.page
                  return pageNum === 1 || 
                         pageNum === data.pagination.totalPages || 
                         (pageNum >= current - 1 && pageNum <= current + 1)
                })
                .map((pageNum, index, array) => (
                  <div key={pageNum} className="flex items-center">
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={pageNum === data.pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </div>
                ))
              }
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(data.pagination.page + 1)}
              disabled={!data.pagination.hasNext}
            >
              Next
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {data?.pagination && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)} of {data.pagination.totalCount} products
          </div>
        )}
      </div>
    </MainLayout>
  )
}