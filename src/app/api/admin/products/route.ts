import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
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

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.categoryId || body.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
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

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: body.slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        price: body.price,
        discountPrice: body.discountPrice || null,
        stock: body.stock || 0,
        categoryId: body.categoryId,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured || false,
        images: body.images || []
      }
    })

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
      },
      { status: 500 }
    )
  }
}