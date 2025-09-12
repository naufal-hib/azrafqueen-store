import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

// Types for request body
interface CartItem {
  productId: string
  productName: string
  variantId?: string
  variantInfo?: string
  quantity: number
  price: number
  subtotal: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

interface PaymentMethod {
  method: string
}

interface OrderRequestBody {
  customerInfo: CustomerInfo
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  items: CartItem[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  notes?: string
}

// Helper function to generate order number
function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestamp = now.getTime().toString().slice(-6) // Last 6 digits of timestamp
  
  return `ORD-${year}${month}${day}-${timestamp}`
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequestBody = await request.json()
    
    // Validate request body structure
    if (!body.customerInfo || !body.shippingAddress || !body.paymentMethod || !body.items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate each item structure
    for (const item of body.items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { success: false, error: 'Invalid item data' },
          { status: 400 }
        )
      }
    }

    // Validate products exist and have sufficient stock
    for (const item of body.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: item.variantId ? {
            where: { id: item.variantId }
          } : false
        }
      })

      if (!product || !product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productName} is no longer available` },
          { status: 400 }
        )
      }

      // Check stock
      let availableStock = product.stock
      if (item.variantId && product.variants && product.variants.length > 0) {
        availableStock = product.variants[0].stock
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${item.productName}` },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Map payment method
    const paymentMethodMap: Record<string, string> = {
      'bank_transfer': 'Bank Transfer',
      'qris': 'QRIS',
      'cod': 'Cash on Delivery'
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerInfo.name,
        customerEmail: body.customerInfo.email,
        customerPhone: body.customerInfo.phone,
        shippingAddress: {
          name: body.shippingAddress.name,
          phone: body.shippingAddress.phone,
          address: body.shippingAddress.address,
          city: body.shippingAddress.city,
          province: body.shippingAddress.province,
          postalCode: body.shippingAddress.postalCode,
          notes: body.shippingAddress.notes || ''
        },
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        totalAmount: body.totalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: paymentMethodMap[body.paymentMethod.method] || 'Bank Transfer',
        notes: body.notes || null,
        items: {
          create: body.items.map((item: CartItem) => ({
            productName: item.productName,
            variantInfo: item.variantInfo,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            productId: item.productId,
            variantId: item.variantId || null,
          }))
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

    // Update product stock
    for (const item of body.items) {
      if (item.variantId) {
        // Update variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      } else {
        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')

    if (!orderNumber && !email) {
      return NextResponse.json(
        { success: false, error: 'Order number or email is required' },
        { status: 400 }
      )
    }

    const whereClause: {
      orderNumber?: string
      customerEmail?: string
    } = {}
    
    if (orderNumber) {
      whereClause.orderNumber = orderNumber
    }
    
    if (email) {
      whereClause.customerEmail = email
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            },
            variant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        orders
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders' 
      },
      { status: 500 }
    )
  }
}