import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const showAll = searchParams.get('admin') === 'true'
    
    // Check if this is an admin request
    let whereClause = showAll ? {} : { isActive: true }
    
    if (showAll) {
      // For admin requests, verify authentication
      const session = await auth()
      if (!session || session.user.role !== 'ADMIN') {
        whereClause = { isActive: true } // Fall back to public categories
      }
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: showAll ? categories : { categories }
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories' 
      },
      { status: 500 }
    )
  }
}

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
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : true
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
      data: category
    })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category' 
      },
      { status: 500 }
    )
  }
}