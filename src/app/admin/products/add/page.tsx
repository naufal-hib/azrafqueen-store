"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdmin } from "@/hooks/use-admin"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

interface ProductVariant {
  id?: string
  size: string
  color: string
  stock: number | string
  additionalPrice: number | string
  sku: string
  isActive: boolean
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number | string
  discountPrice: number | string | null
  stock: number | string
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  images: string[]
  variants: ProductVariant[]
}

export default function AddProductPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    discountPrice: null,
    stock: '',
    categoryId: '',
    isActive: true,
    isFeatured: false,
    tags: [],
    images: [],
    variants: []
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [slugError, setSlugError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/products/categories')
        
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Authentication required. Please log in again.')
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setCategories(result.data)
        } else {
          toast.error('Failed to load categories: ' + result.error)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories. Please refresh the page.')
      }
    }

    fetchCategories()
  }, [])

  // Check if slug is unique
  const checkSlugUniqueness = async (slug: string) => {
    if (!slug) {
      setSlugError(null)
      return
    }
    
    try {
      const response = await fetch(`/api/admin/products/check-slug?slug=${encodeURIComponent(slug)}`)
      const result = await response.json()
      
      if (result.success && result.exists) {
        setSlugError('This slug is already in use. Please choose a different one.')
      } else {
        setSlugError(null)
      }
    } catch (error) {
      console.error('Error checking slug:', error)
      // Don't show error to user for this check to avoid confusion
    }
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Handle name change dan auto generate slug
  const handleNameChange = (name: string) => {
    const newSlug = generateSlug(name)
    setFormData(prev => ({
      ...prev,
      name,
      slug: newSlug
    }))
    
    // Clear error for name field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.name
      return newErrors
    })
    
    // Check slug uniqueness
    checkSlugUniqueness(newSlug)
  }

  // Handle slug change
  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      slug
    }))
    
    // Clear error for slug field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.slug
      return newErrors
    })
    
    // Check slug uniqueness
    checkSlugUniqueness(slug)
  }

  // Handle price change
  const handlePriceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      price: value
    }))
    
    // Clear error for price field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.price
      return newErrors
    })
  }

  // Handle discount price change
  const handleDiscountPriceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      discountPrice: value || null
    }))
    
    // Clear error for discountPrice field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.discountPrice
      return newErrors
    })
  }

  // Handle stock change
  const handleStockChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      stock: value
    }))
    
    // Clear error for stock field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.stock
      return newErrors
    })
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: value
    }))
    
    // Clear error for category field
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.categoryId
      return newErrors
    })
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Convert FileList to Array
    const fileList = Array.from(files)
    
    // Check file types and size
    const validFiles = fileList.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    if (validFiles.length !== fileList.length) {
      toast.error('Some files were skipped. Only images under 10MB are allowed.')
    }
    
    // Limit to 5 images total
    const totalImages = newImageFiles.length + validFiles.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed in total')
      return
    }
    
    // Create previews for new files
    const previews = validFiles.map(file => URL.createObjectURL(file))
    
    // Add to existing previews and files
    setNewImageFiles(prev => [...prev, ...validFiles])
    setImagePreviews(prev => [...prev, ...previews])
    
    // Clear input
    e.target.value = ''
  }

  // Remove image preview
  const removeImage = (index: number) => {
    // Clean up URL object
    URL.revokeObjectURL(imagePreviews[index])
    
    // Remove from previews and files
    const newPreviews = [...imagePreviews]
    const newFiles = [...newImageFiles]
    newPreviews.splice(index, 1)
    newFiles.splice(index, 1)
    
    setImagePreviews(newPreviews)
    setNewImageFiles(newFiles)
  }

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Add new variant
  const addVariant = () => {
    const newVariant: ProductVariant = {
      size: '',
      color: '',
      stock: '',
      additionalPrice: '',
      sku: '',
      isActive: true
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  // Remove variant
  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  // Update variant
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required'
    }
    
    if (!formData.slug.trim()) {
      errors.slug = 'URL slug is required'
    } else if (slugError) {
      errors.slug = slugError
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Please select a category'
    }
    
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0'
    }
    
    if (formData.discountPrice !== null && formData.discountPrice !== '' && Number(formData.discountPrice) <= 0) {
      errors.discountPrice = 'Discount price must be greater than 0 or empty'
    }
    
    if (formData.discountPrice !== null && formData.discountPrice !== '' && Number(formData.discountPrice) >= Number(formData.price)) {
      errors.discountPrice = 'Discount price must be less than regular price'
    }
    
    if (!formData.stock || Number(formData.stock) < 0) {
      errors.stock = 'Stock must be 0 or greater'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      setLoading(true)
      
      let finalFormData = { ...formData }
      
      // Upload images if any
      if (newImageFiles.length > 0) {
        const uploadFormData = new FormData()
        newImageFiles.forEach(file => {
          uploadFormData.append('files', file)
        })

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          // Set uploaded filenames to form data
          finalFormData.images = uploadResult.data.files
          toast.success(`Uploaded ${newImageFiles.length} image(s)`)
          
          // Clean up previews
          imagePreviews.forEach(preview => URL.revokeObjectURL(preview))
          setImagePreviews([])
          setNewImageFiles([])
        } else {
          toast.error(`Failed to upload images: ${uploadResult.error}`)
          setLoading(false)
          return
        }
      }
      
      // Prepare data with proper types
      const submitData = {
        ...finalFormData,
        price: Number(finalFormData.price),
        discountPrice: finalFormData.discountPrice ? Number(finalFormData.discountPrice) : null,
        stock: Number(finalFormData.stock),
        variants: finalFormData.variants.map(variant => ({
          ...variant,
          stock: Number(variant.stock) || 0,
          additionalPrice: Number(variant.additionalPrice) || 0
        }))
      }
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Product created successfully')
        router.push('/admin/products')
      } else {
        console.error('API Error:', result.error)
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to create product. Please check your connection and try again.')
    } finally {
      setLoading(false)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-muted-foreground">Create a new product for your store</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic product details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter product name"
                      required
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="product-url-slug"
                      className={formErrors.slug || slugError ? "border-red-500" : ""}
                    />
                    {formErrors.slug && (
                      <p className="text-sm text-red-500">{formErrors.slug}</p>
                    )}
                    {slugError && !formErrors.slug && (
                      <p className="text-sm text-red-500">{slugError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>
                  Set product pricing and stock information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="Enter price"
                      min="0"
                      step="1000"
                      required
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Sale Price</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      value={formData.discountPrice || ''}
                      onChange={(e) => handleDiscountPriceChange(e.target.value)}
                      placeholder="Enter sale price"
                      min="0"
                      step="1000"
                      className={formErrors.discountPrice ? "border-red-500" : ""}
                    />
                    {formErrors.discountPrice && (
                      <p className="text-sm text-red-500">{formErrors.discountPrice}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleStockChange(e.target.value)}
                      placeholder="Enter stock quantity"
                      min="0"
                      required
                      className={formErrors.stock ? "border-red-500" : ""}
                    />
                    {formErrors.stock && (
                      <p className="text-sm text-red-500">{formErrors.stock}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload product images (first image will be the main image)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag & drop images here, or click to select files
                    </p>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation()
                        triggerFileInput()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Images
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: JPG, PNG. Max 5 images.
                    </p>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Images to Upload (Preview)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Preview
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        These images will be uploaded when you save the product.
                      </p>
                    </div>
                  )}

                  {/* Development Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Development Mode:</strong> Image upload functionality will be implemented in the next phase with cloud storage integration. For now, images are simulated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active Product</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Featured Product</Label>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Product Category *</Label>
                  <Select 
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                    required
                  >
                    <SelectTrigger className={formErrors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.categoryId && (
                    <p className="text-sm text-red-500">{formErrors.categoryId}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Choose the appropriate category for this product
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // Quick add common sizes
                        const sizes = ['S', 'M', 'L', 'XL']
                        sizes.forEach(size => {
                          const newVariant: ProductVariant = {
                            size,
                            color: '',
                            stock: '',
                            additionalPrice: '',
                            sku: '',
                            isActive: true
                          }
                          setFormData(prev => ({
                            ...prev,
                            variants: [...prev.variants, newVariant]
                          }))
                        })
                      }}
                      disabled={formData.variants.length > 0}
                    >
                      Quick: Sizes (S-XL)
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={addVariant}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Add different variations of your product. You can create variants with size only, color only, or both size and color combinations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.variants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No variants added yet. Click "Add Variant" to create your first variant.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Size */}
                          <div className="space-y-2">
                            <Label>Size (Optional)</Label>
                            <Input
                              placeholder="e.g. S, M, L, XL (leave blank if no size variants)"
                              value={variant.size}
                              onChange={(e) => updateVariant(index, 'size', e.target.value)}
                            />
                          </div>
                          
                          {/* Color */}
                          <div className="space-y-2">
                            <Label>Color (Optional)</Label>
                            <Input
                              placeholder="e.g. Black, Navy, White (leave blank if no color variants)"
                              value={variant.color}
                              onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            />
                          </div>
                          
                          {/* Stock */}
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                            />
                          </div>
                          
                          {/* Additional Price */}
                          <div className="space-y-2">
                            <Label>Additional Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={variant.additionalPrice}
                              onChange={(e) => updateVariant(index, 'additionalPrice', e.target.value)}
                            />
                          </div>
                          
                          {/* SKU */}
                          <div className="space-y-2">
                            <Label>SKU (Optional)</Label>
                            <Input
                              placeholder="e.g. ABY-001-S-BLK"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            />
                          </div>
                          
                          {/* Active Status */}
                          <div className="space-y-2">
                            <Label>Active Status</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={variant.isActive}
                                onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Development Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-800">
                    <strong>Development Mode:</strong> Form is ready and connected to API.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}