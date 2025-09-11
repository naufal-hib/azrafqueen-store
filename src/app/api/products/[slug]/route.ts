import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      )
    }

    // Get product with full details
    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          }
        },
        variants: {
          where: { isActive: true },
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ]
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    })

  } catch (error) {
    console.error('Error fetching product details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product details' 
      },
      { status: 500 }
    )
  }
}