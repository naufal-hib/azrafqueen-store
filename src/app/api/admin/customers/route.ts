import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (role && role !== 'all') {
      where.role = role.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users with order statistics
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Calculate statistics for each user
    const usersWithStats = users.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const lastOrderDate = user.orders.length > 0 
        ? Math.max(...user.orders.map(order => new Date(order.createdAt).getTime()))
        : null

      return {
        ...user,
        totalSpent,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate).toISOString() : null,
        orders: user.orders // Keep orders for detail view if needed
      }
    })

    // Get overall statistics
    const stats = {
      total: await prisma.user.count(),
      customers: await prisma.user.count({ where: { role: 'CUSTOMER' } }),
      admins: await prisma.user.count({ where: { role: 'ADMIN' } }),
      withOrders: await prisma.user.count({
        where: {
          orders: {
            some: {}
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { name, email, role = 'CUSTOMER' } = data

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase(),
        image: data.image || null
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Customer created successfully'
    })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}