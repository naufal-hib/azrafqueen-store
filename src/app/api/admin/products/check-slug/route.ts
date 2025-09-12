import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products/check-slug?slug=... - Check if slug is unique
export async function GET(request: NextRequest) {
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

    // Get slug from query params
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      )
    }

    // Check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    return NextResponse.json({
      success: true,
      exists: !!existingProduct
    })

  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check slug' 
      },
      { status: 500 }
    )
  }
}