import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/admin/products/[id]/variants - Get product variants
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
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

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: variants
    })

  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

// POST /api/admin/products/[id]/variants - Create multiple variants
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
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
    const body = await request.json()

    // Validate that product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate variants data
    if (!body.variants || !Array.isArray(body.variants)) {
      return NextResponse.json(
        { success: false, error: 'Variants data is required' },
        { status: 400 }
      )
    }

    // Use transaction to create/update variants
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing variants first
      await tx.productVariant.deleteMany({
        where: { productId }
      })

      // Create new variants
      const variants = await Promise.all(
        body.variants.map((variant: any) => {
          return tx.productVariant.create({
            data: {
              productId,
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

      return variants
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error creating variants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create variants' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id]/variants - Delete all variants
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
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

    await prisma.productVariant.deleteMany({
      where: { productId }
    })

    return NextResponse.json({
      success: true,
      message: 'All variants deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting variants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete variants' },
      { status: 500 }
    )
  }
}