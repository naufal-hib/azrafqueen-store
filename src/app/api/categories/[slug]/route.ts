import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock') === 'true'

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required' },
        { status: 400 }
      )
    }

    // First, get the category
    const category = await prisma.category.findUnique({
      where: {
        slug,
        isActive: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Build where clause for products with proper typing
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      categoryId: category.id,
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Stock filter
    if (inStock) {
      where.stock = { gt: 0 }
    }

    // Build orderBy clause with proper typing
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: 'desc' }

    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              size: true,
              color: true,
              stock: true,
              additionalPrice: true,
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    })

  } catch (error) {
    console.error('Error fetching category products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch category products' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category (Admin only)
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

    const { slug: categoryId } = await params
    
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if category exists (using ID from slug param - assuming slug is actually ID for admin routes)
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (excluding current category)
    if (body.slug !== existingCategory.slug) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { slug: body.slug }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { success: false, error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : existingCategory.isActive
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCategory
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category (Admin only)
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

    const { slug: categoryId } = await params

    // Check if category exists (using ID from slug param)
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category with ${existingCategory._count.products} products` },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}