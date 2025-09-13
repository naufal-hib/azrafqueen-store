"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tags, Plus, Search, Edit, Trash2, Package, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog"
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
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  _count: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
  isActive: boolean
}

export default function AdminCategoriesPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    isActive: true
  })
  const [formLoading, setFormLoading] = useState(false)

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories?admin=true')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        setError('Failed to fetch categories')
      }
    } catch (err) {
      setError('Error loading categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories berdasarkan search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Handle name change and auto generate slug
  const handleNameChange = (name: string) => {
    const newSlug = generateSlug(name)
    setFormData(prev => ({
      ...prev,
      name,
      slug: newSlug
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true
    })
  }

  // Handle add category
  const handleAddCategory = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  // Handle view category
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsDetailModalOpen(true)
  }

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isActive: category.isActive
    })
    setIsDetailModalOpen(false)
    setIsEditDialogOpen(true)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setFormLoading(true)
      
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}` 
        : '/api/categories'
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully')
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingCategory(null)
        await fetchCategories()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to save category. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle delete category
  const handleDeleteCategory = async (category: Category) => {
    if (category._count.products > 0) {
      toast.error(`Cannot delete category with ${category._count.products} products. Move products to other categories first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Category deleted successfully')
        await fetchCategories()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to delete category. Please try again.')
    }
  }

  // Toggle category status
  const handleToggleStatus = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: !category.isActive
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`)
        await fetchCategories()
        
        // Also update the selectedCategory if it's the same category
        if (selectedCategory && selectedCategory.id === category.id) {
          setSelectedCategory({
            ...selectedCategory,
            isActive: !category.isActive
          })
        }
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to update category status.')
    }
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
            <h1 className="text-lg font-semibold">Categories Management</h1>
            <p className="text-sm text-muted-foreground">Organize your products with categories</p>
          </div>
          <Button size="sm" onClick={handleAddCategory}>
            <Plus className="h-3 w-3 mr-1" />
            <span className="text-xs">Add Category</span>
          </Button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search categories..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Card className="px-3 py-2">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-base font-bold text-blue-600">{categories.length}</div>
            </Card>
            <Card className="px-3 py-2">
              <div className="text-xs text-muted-foreground">Active</div>
              <div className="text-base font-bold text-green-600">
                {categories.filter(c => c.isActive).length}
              </div>
            </Card>
          </div>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Tags className="h-4 w-4 mr-2" />
              Product Categories ({filteredCategories.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Manage product categories and organization
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
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No categories found' : 'No categories yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `No categories match "${searchQuery}"`
                    : 'Start by creating your first product category'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Category
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4">
                  {filteredCategories.map((category) => (
                    <Card 
                      key={category.id} 
                      className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewCategory(category)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">/{category.slug}</p>
                          </div>
                          <Badge 
                            variant={category.isActive ? 'default' : 'secondary'}
                            className="text-xs ml-2"
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {category.description || 'No description'}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            <span>{category._count.products} products</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(category.createdAt).toLocaleDateString()}
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
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow 
                          key={category.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={(e) => {
                            // Only trigger row click if not clicking on the toggle or its label
                            if (!(e.target instanceof HTMLElement) || 
                                !e.target.closest('.switch-container')) {
                              handleViewCategory(category);
                            }
                          }}
                        >
                        <TableCell>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              /{category.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate text-sm text-muted-foreground">
                            {category.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{category._count.products}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 switch-container">
                            <Switch
                              checked={category.isActive}
                              onCheckedChange={() => handleToggleStatus(category)}
                              size="sm"
                            />
                            <Badge 
                              variant={category.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </div>
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

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new product category to organize your store.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Category Name *</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-slug">URL Slug</Label>
                <Input
                  id="add-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-url-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="add-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="add-active">Active category</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">URL Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-url-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-active">Active category</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingCategory(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Updating...' : 'Update Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg">Category Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    View detailed information about this category
                  </DialogDescription>
                </div>
                {selectedCategory && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCategory(selectedCategory)}
                      title="Edit Category"
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
                        handleDeleteCategory(selectedCategory)
                        setIsDetailModalOpen(false)
                      }}
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>
            
            {selectedCategory && (
              <div className="space-y-4">
                {/* Category Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-medium">{selectedCategory.name}</h3>
                      <p className="text-xs text-muted-foreground">/{selectedCategory.slug}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedCategory.description || 'No description available'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Products Count</h4>
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{selectedCategory._count.products} products</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Status</h4>
                      <div className="flex items-center space-x-2 switch-container">
                        <Switch
                          checked={selectedCategory.isActive}
                          onCheckedChange={() => handleToggleStatus(selectedCategory)}
                          size="sm"
                        />
                        <Badge 
                          variant={selectedCategory.isActive ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {selectedCategory.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Created</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedCategory.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedCategory.updatedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}