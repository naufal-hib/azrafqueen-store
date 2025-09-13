"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdmin } from "@/hooks/use-admin"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  stock: number
  isActive: boolean
  isFeatured: boolean
  images: string[]
  category: {
    name: string
    slug: string
  }
  _count: {
    variants: number
  }
  createdAt: string
}

// Helper function to validate image URLs
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url)
    return url.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico)(\?.*)?$/i) !== null
  } catch {
    return false
  }
}

export default function AdminProductsPage() {
  const { isLoading: authLoading } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?limit=50')
        const result = await response.json()
        
        if (result.success) {
          setProducts(result.data.products)
        } else {
          setError('Failed to fetch products')
        }
      } catch (err) {
        setError('Error loading products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products berdasarkan search dan filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive) ||
                         (filterStatus === 'inactive' && !product.isActive) ||
                         (filterStatus === 'featured' && product.isFeatured) ||
                         (filterStatus === 'low-stock' && product.stock < 10)
    
    const matchesCategory = filterCategory === 'all' || product.category.name === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories for filter
  const categories = [...new Set(products.map(p => p.category.name))]

  // State for product detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Action handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDetailModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/products/edit/${product.id}`)
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      console.log(`Attempting to delete product: ${product.id}`)
      
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log(`Delete response status: ${response.status}`)

      if (!response.ok) {
        let errorMessage = 'Failed to delete product'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch {
          errorMessage = `HTTP Error: ${response.status} ${response.statusText}`
        }
        console.error('Delete failed:', errorMessage)
        toast.error(`Error: ${errorMessage}`)
        return
      }

      const result = await response.json()
      console.log('Delete result:', result)

      if (result.success) {
        toast.success('Product deleted successfully')
        // Refresh products list by removing the deleted product
        setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id))
      } else {
        toast.error(`Error: ${result.error || 'Delete operation failed'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Network error: Failed to delete product')
    }
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setSearchQuery('')
  }

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Manajemen Produk</h1>
            <p className="text-sm text-muted-foreground">Kelola produk, inventaris, dan harga</p>
          </div>
          <Button size="sm" onClick={() => router.push('/admin/products/add')}>
            <Plus className="h-3 w-3 mr-1" />
            <span className="text-xs">Tambah</span>
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name or category..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Filter className="h-3 w-3 mr-1" />
                <span className="text-xs">Filter</span>
                {(filterStatus !== 'all' || filterCategory !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    {(filterStatus !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Apply multiple filters to find exactly what you need
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Actions */}
                <div className="space-y-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
                
                {/* Active Filters Display */}
                {(filterStatus !== 'all' || filterCategory !== 'all') && (
                  <div className="space-y-2 pt-4 border-t">
                    <label className="text-sm font-medium">Active Filters:</label>
                    <div className="flex flex-wrap gap-2">
                      {filterStatus !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Status: {filterStatus}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setFilterStatus('all')}
                          />
                        </Badge>
                      )}
                      {filterCategory !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Category: {filterCategory}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setFilterCategory('all')}
                          />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={filterStatus === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="text-xs h-7"
            >
              All Products
            </Button>
            <Button 
              variant={filterStatus === 'active' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="text-xs h-7"
            >
              Active ({products.filter(p => p.isActive).length})
            </Button>
            <Button 
              variant={filterStatus === 'inactive' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
              className="text-xs h-7"
            >
              Inactive ({products.filter(p => !p.isActive).length})
            </Button>
            <Button 
              variant={filterStatus === 'featured' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus('featured')}
              className="text-xs h-7"
            >
              Featured ({products.filter(p => p.isFeatured).length})
            </Button>
            <Button 
              variant={filterStatus === 'low-stock' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus('low-stock')}
              className="text-xs h-7"
            >
              Low Stock ({products.filter(p => p.stock < 10).length})
            </Button>
            {(filterStatus !== 'all' || filterCategory !== 'all' || searchQuery) && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Very compact */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-blue-600">{products.length}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-green-600">
                {products.filter(p => p.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-orange-600">
                {products.filter(p => p.stock < 10).length}
              </div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-purple-600">
                {products.filter(p => p.isFeatured).length}
              </div>
              <p className="text-xs text-muted-foreground">Featured</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Package className="h-4 w-4 mr-2" />
              All Products ({filteredProducts.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `No products match "${searchQuery}"`
                    : 'Start by adding your first product'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push('/admin/products/add')}>
  <Plus className="h-4 w-4 mr-2" />
  Add First Product
</Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                            {product.images[0] && isValidImageUrl(product.images[0]) ? (
                              <Image 
                                src={product.images[0]} 
                                alt={product.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  ID: {product.id.slice(0, 8)}...
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {product.category.name}
                              </Badge>
                            </div>
                            
                            {/* Price and Stock Row */}
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-sm">
                                  {formatCurrency(product.discountPrice || product.price)}
                                </div>
                                {product.discountPrice && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(product.price)}
                                  </div>
                                )}
                              </div>
                              <Badge 
                                variant={
                                  product.stock === 0 ? 'destructive' :
                                  product.stock < 10 ? 'secondary' : 'default'
                                }
                                className="text-xs h-7"
                              >
                                {product.stock} stok
                              </Badge>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge 
                                variant={product.isActive ? 'default' : 'secondary'}
                                className="text-xs h-7"
                              >
                                {product.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                              {product.isFeatured && (
                                <Badge variant="secondary" className="text-xs">
                                  Unggulan
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {product._count.variants} varian
                              </Badge>
                            </div>
                            
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Variants</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewProduct(product)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                {product.images[0] && isValidImageUrl(product.images[0]) ? (
                                <Image 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                                ) : (
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {product.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {formatCurrency(product.discountPrice || product.price)}
                              </div>
                              {product.discountPrice && (
                                <div className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.price)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                product.stock === 0 ? 'destructive' :
                                product.stock < 10 ? 'secondary' : 'default'
                              }
                            >
                              {product.stock} in stock
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant={product.isActive ? 'default' : 'secondary'}
                                className="w-fit"
                              >
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {product.isFeatured && (
                                <Badge variant="secondary" className="w-fit">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {product._count.variants} variants
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Product Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg">Product Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    View detailed information about this product
                  </DialogDescription>
                </div>
                {selectedProduct && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditProduct(selectedProduct)}
                      title="Edit Product"
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-xs">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        handleDeleteProduct(selectedProduct)
                        setIsDetailModalOpen(false)
                      }}
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-4">
                {/* Product Images */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Gambar Produk</h3>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden border">
                          {image && image.trim() !== '' ? (
                            <Image 
                              src={image.startsWith('/') ? image : `/uploads/${image}`}
                              alt={`${selectedProduct.name} - Gambar ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-muted">
                                      <div class="text-center">
                                        <svg class="h-4 w-4 mx-auto text-muted-foreground mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-xs text-muted-foreground">Error</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/50 rounded-lg border-2 border-dashed">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Tidak ada gambar</p>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-medium">{selectedProduct.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: {selectedProduct.id}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Pricing</h4>
                      <div className="space-y-1">
                        <p className="text-xs">
                          <span className="font-medium">Price:</span> {formatCurrency(selectedProduct.price)}
                        </p>
                        {selectedProduct.discountPrice && (
                          <p className="text-xs">
                            <span className="font-medium">Discount Price:</span> {formatCurrency(selectedProduct.discountPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Inventory</h4>
                      <p className="text-xs">
                        <span className="font-medium">Stock:</span> {selectedProduct.stock} items
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Category</h4>
                      <Badge variant="outline" className="text-xs">{selectedProduct.category.name}</Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Status</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'} className="text-xs">
                          {selectedProduct.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {selectedProduct.isFeatured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                        <Badge variant={
                          selectedProduct.stock === 0 ? 'destructive' :
                          selectedProduct.stock < 10 ? 'secondary' : 'default'
                        } className="text-xs">
                          {selectedProduct.stock === 0 ? 'Out of Stock' :
                           selectedProduct.stock < 10 ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Variants</h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedProduct._count.variants} variant(s) available
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Created</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedProduct.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}