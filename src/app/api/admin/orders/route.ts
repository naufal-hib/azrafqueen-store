import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get orders with items
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Get order statistics
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusCounts
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
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
    const {
      customerName,
      customerEmail, 
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      notes
    } = data

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      })

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }

      let price = product.discountPrice || product.price
      let variantInfo = null

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId)
        if (variant) {
          price += variant.additionalPrice || 0
          variantInfo = `${variant.size || ''} ${variant.color || ''}`.trim()
        }
      }

      const itemSubtotal = price * item.quantity
      subtotal += itemSubtotal

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        variantInfo,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal
      })
    }

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`

    // Create order
    const shippingCost = data.shippingCost || 0
    const totalAmount = subtotal + shippingCost

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        subtotal,
        shippingCost,
        totalAmount,
        paymentMethod,
        notes,
        userId: data.userId || null,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}