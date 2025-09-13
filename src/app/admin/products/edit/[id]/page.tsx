"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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

// Helper function to format image URLs
const formatImageUrl = (image: string): string => {
  // If it's already a valid URL, return as is
  if (image?.startsWith('http') || image?.startsWith('/')) {
    return image
  }
  
  // If it's just a filename, assume it's in the uploads folder
  if (image && typeof image === 'string' && image.includes('.')) {
    return `/uploads/${image}`
  }
  
  // Fallback to placeholder
  return '/images/placeholder-product.svg'
}

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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice: number | null
  stock: number
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  images: string[]
  variants?: ProductVariant[]
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  discountPrice: number | null
  stock: number
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  images: string[]
  variants: ProductVariant[]
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    discountPrice: null,
    stock: 0,
    categoryId: '',
    isActive: true,
    isFeatured: false,
    tags: [],
    images: [],
    variants: []
  })
  const [slugError, setSlugError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(`/api/admin/products/${resolvedParams.id}`)
        const result = await response.json()
        
        if (result.success) {
          const productData = result.data
          setProduct(productData)
          // Format images with proper paths
          const formattedImages = (productData.images || []).map(formatImageUrl)
          
          setFormData({
            name: productData.name,
            slug: productData.slug,
            description: productData.description || '',
            price: productData.price,
            discountPrice: productData.discountPrice,
            stock: productData.stock,
            categoryId: productData.categoryId,
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            tags: [],
            images: formattedImages,
            variants: (productData.variants || []).map((variant: any) => ({
              id: variant.id,
              size: variant.size || '',
              color: variant.color || '',
              stock: variant.stock || 0,
              additionalPrice: variant.additionalPrice || 0,
              sku: variant.sku || '',
              isActive: variant.isActive
            }))
          })
        } else {
          toast.error('Failed to load product')
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Error loading product')
        router.push('/admin/products')
      } finally {
        setFetchLoading(false)
      }
    }

    if (resolvedParams.id) {
      fetchProduct()
    }
  }, [resolvedParams.id, router])

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
    if (!slug || slug === product?.slug) {
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
    
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.name
      return newErrors
    })
    
    checkSlugUniqueness(newSlug)
  }

  // Handle slug change
  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      slug
    }))
    
    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.slug
      return newErrors
    })
    
    checkSlugUniqueness(slug)
  }

  // Handle image selection (preview only, upload on save)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only images under 10MB are allowed.')
    }

    // Create previews for new files
    const previews = validFiles.map(file => URL.createObjectURL(file))
    
    // Add to state for preview and later upload
    setNewImageFiles(prev => [...prev, ...validFiles])
    setImagePreviews(prev => [...prev, ...previews])
    
    // Clear input
    e.target.value = ''
  }

  // Remove existing image
  const removeExistingImage = (index: number) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  // Remove preview image
  const removePreviewImage = (index: number) => {
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
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0'
    }
    
    if (formData.discountPrice !== null && formData.discountPrice <= 0) {
      errors.discountPrice = 'Discount price must be greater than 0 or empty'
    }
    
    if (formData.discountPrice !== null && formData.discountPrice >= formData.price) {
      errors.discountPrice = 'Discount price must be less than regular price'
    }
    
    if (formData.stock < 0) {
      errors.stock = 'Stock cannot be negative'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      setLoading(true)
      
      let finalFormData = { ...formData }
      
      // Upload new images if any
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
          // Add new uploaded filenames to existing images
          finalFormData.images = [...finalFormData.images, ...uploadResult.data.files]
          toast.success(`Uploaded ${newImageFiles.length} new image(s)`)
          
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

      // Update product variants
      if (finalFormData.variants.length > 0) {
        const variantsResponse = await fetch(`/api/admin/products/${resolvedParams.id}/variants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variants: finalFormData.variants.map(variant => ({
              size: variant.size,
              color: variant.color,
              stock: Number(variant.stock) || 0,
              additionalPrice: Number(variant.additionalPrice) || 0,
              sku: variant.sku,
              isActive: variant.isActive
            }))
          }),
        })

        const variantsResult = await variantsResponse.json()
        if (!variantsResult.success) {
          toast.error(`Failed to update variants: ${variantsResult.error}`)
        }
      }
      
      const response = await fetch(`/api/admin/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Product updated successfully')
        router.push('/admin/products')
      } else {
        console.error('API Error:', result.error)
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to update product. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold mb-2">Product not found</h2>
          <Button onClick={() => router.push('/admin/products')}>
            Back to Products
          </Button>
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
              <h1 className="text-2xl font-bold">Edit Product</h1>
              <p className="text-muted-foreground">Update product information</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Product
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
                  Update the basic product details
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
                  Update product pricing and stock information
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
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="0"
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
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        discountPrice: e.target.value ? Number(e.target.value) : null 
                      }))}
                      placeholder="0"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      placeholder="0"
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
                  Update product images (first image will be the main image)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Images</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-square bg-muted rounded-md overflow-hidden">
                              <Image 
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="200px"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  if (target.src !== '/images/placeholder-product.svg') {
                                    target.src = '/images/placeholder-product.svg'
                                  }
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExistingImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Images to Add (Preview)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative group">
                            <div className="aspect-square bg-muted rounded-md overflow-hidden">
                              <img 
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePreviewImage(index)}
                            >
                              <X className="h-3 w-3" />
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
                    <h3 className="text-lg font-semibold mb-2">Add More Images</h3>
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
                      Recommended: JPG, PNG. Max 5 images total.
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
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
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
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
                <CardDescription>
                  Manage different variations of your product. You can create variants with size only, color only, or both size and color combinations.
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
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}