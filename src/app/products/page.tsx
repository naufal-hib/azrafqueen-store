"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Filter, SortAsc, Search } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductFilters } from "@/components/product/product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  _count: {
    products: number
  }
}

export default function AllProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

  // Get parameters from URL
  const categoryFromUrl = searchParams.get('category')
  const searchFromUrl = searchParams.get('search')

  // Set selected category and search from URL params
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [categoryFromUrl, searchFromUrl])

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ])

        const productsResult = await productsRes.json()
        const categoriesResult = await categoriesRes.json()

        if (productsResult.success) {
          setProducts(productsResult.data.products)
        }

        if (categoriesResult.success) {
          setCategories(categoriesResult.data.categories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products based on search, category, and price
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category.slug === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price)
      case "price-high":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price)
      case "name":
        return a.name.localeCompare(b.name)
      case "newest":
      default:
        return 0 // In a real app, you'd sort by creation date
    }
  })

  // Update URL with current search parameters
  const updateURL = (newSearchQuery?: string, newCategory?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newSearchQuery !== undefined) {
      if (newSearchQuery.trim()) {
        params.set('search', newSearchQuery.trim())
      } else {
        params.delete('search')
      }
    }
    
    if (newCategory !== undefined) {
      if (newCategory !== 'all') {
        params.set('category', newCategory)
      } else {
        params.delete('category')
      }
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(searchQuery)
  }

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory)
    updateURL(searchQuery, newCategory)
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
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          {selectedCategory && selectedCategory !== "all" && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchQuery ? (
              `Search Results for "${searchQuery}"`
            ) : selectedCategory && selectedCategory !== "all" ? (
              `${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
            ) : (
              "All Products"
            )}
          </h1>
          <p className="text-muted-foreground text-lg">
            {searchQuery ? (
              `Searching for products matching "${searchQuery}"`
            ) : selectedCategory && selectedCategory !== "all" ? (
              `Browse our collection of ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory} products`
            ) : (
              "Discover our complete collection of Islamic fashion and religious items"
            )}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Filters and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name} ({category._count.products})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="sm:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductFilters
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={handleCategoryChange}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Clear Filters */}
              {(selectedCategory && selectedCategory !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchQuery("")
                    router.push(pathname, { scroll: false })
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory && selectedCategory !== "all" && (
              <Badge variant="secondary">
                Category: {categories.find(c => c.slug === selectedCategory)?.name}
                <button
                  className="ml-2 text-xs hover:text-destructive"
                  onClick={() => handleCategoryChange("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary">
                Search: "{searchQuery}"
                <button
                  className="ml-2 text-xs hover:text-destructive"
                  onClick={() => {
                    setSearchQuery("")
                    updateURL("")
                  }}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {loading ? (
            "Loading products..."
          ) : searchQuery ? (
            `Found ${sortedProducts.length} products matching "${searchQuery}"`
          ) : (
            `Showing ${sortedProducts.length} of ${products.length} products`
          )}
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <ProductGrid
            products={sortedProducts}
            isLoading={loading}
            emptyMessage={
              searchQuery || selectedCategory
                ? "No products found matching your filters. Try adjusting your search criteria."
                : "No products available at the moment. Please check back later."
            }
          />
        </div>

        {/* Load More Button - For future pagination */}
        {!loading && sortedProducts.length > 0 && sortedProducts.length < products.length && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && products.length > 0 && (
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Product Statistics</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {products.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {products.filter(p => p.isFeatured).length}
                </div>
                <div className="text-sm text-muted-foreground">Featured Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {products.filter(p => p.stock > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}