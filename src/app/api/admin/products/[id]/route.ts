import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/admin/products/[id] - Get single product (Admin only)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id: productId } = await params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            additionalPrice: true,
            sku: true,
            isActive: true
          }
        },
        _count: {
          select: {
            variants: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id: productId } = await params
    
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.categoryId || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Check if slug is unique (excluding current product)
    if (body.slug !== existingProduct.slug) {
      const duplicateProduct = await prisma.product.findUnique({
        where: { slug: body.slug }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { success: false, error: 'Product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        price: body.price,
        discountPrice: body.discountPrice || null,
        stock: body.stock || 0,
        categoryId: body.categoryId,
        isActive: body.isActive !== undefined ? body.isActive : existingProduct.isActive,
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : existingProduct.isFeatured,
        images: body.images || existingProduct.images
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            variants: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id: productId } = await params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            variants: true
          }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product variants first (due to foreign key constraints)
    if (existingProduct._count.variants > 0) {
      await prisma.productVariant.deleteMany({
        where: { productId }
      })
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}