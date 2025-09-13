import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
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

    // Create product with variants
    const result = await prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
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

      // Create variants if provided
      if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
        const variants = await Promise.all(
          body.variants.map((variant: any) => {
            return tx.productVariant.create({
              data: {
                productId: product.id,
                size: variant.size || null,
                color: variant.color || null,
                stock: Number(variant.stock) || 0,
                additionalPrice: Number(variant.additionalPrice) || 0,
                sku: variant.sku || null,
                isActive: variant.isActive !== undefined ? variant.isActive : true
              }
            })
          })
        )

        return {
          ...product,
          variants
        }
      }

      return product
    })

    return NextResponse.json({
      success: true,
      data: result
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