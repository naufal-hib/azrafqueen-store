import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

// GET /api/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { 
        slug: slug,
        isActive: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
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
            sku: true,
            isActive: true
          },
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

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id } // Exclude current product
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            additionalPrice: true
          }
        }
      },
      orderBy: { isFeatured: 'desc' },
      take: 8 // Limit to 8 related products
    })

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
