import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const reportType = searchParams.get('type') || 'overview'
    
    const days = parseInt(period)
    if (isNaN(days) || days <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid period parameter' },
        { status: 400 }
      )
    }
    
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Get previous period for comparison
    const prevEndDate = new Date(startDate)
    const prevStartDate = new Date(prevEndDate.getTime() - days * 24 * 60 * 60 * 1000)

    switch (reportType) {
      case 'sales':
        return await getSalesReport(startDate, endDate)
      
      case 'products':
        return await getProductReport(startDate, endDate)
      
      case 'customers':
        return await getCustomerReport(startDate, endDate)
      
      default:
        return await getOverviewReport(startDate, endDate, prevStartDate, prevEndDate)
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function getOverviewReport(startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date) {
  try {
    // Current period stats
    const currentRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'PAID'
      }
    })
    
    const currentOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    })
    
    const currentCustomers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        role: 'CUSTOMER'
      }
    })
    
    const currentProducts = await prisma.product.count({
      where: { isActive: true }
    })
    
    // Top selling products
    const topProducts = await prisma.$queryRaw`
      SELECT 
        oi."productId",
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_subtotal,
        COUNT(oi."productId") as product_count
      FROM "public"."order_items" oi
      JOIN "public"."orders" o ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${startDate} 
        AND o."createdAt" <= ${endDate}
        AND o."paymentStatus" = 'PAID'
      GROUP BY oi."productId"
      ORDER BY total_subtotal DESC
      LIMIT 5
    `
    
    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    })

    // Previous period stats for comparison
    const prevRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        paymentStatus: 'PAID'
      }
    })
    
    const prevOrders = await prisma.order.count({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate }
      }
    })
    
    const prevCustomers = await prisma.user.count({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        role: 'CUSTOMER'
      }
    })

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      (topProducts as any[]).map(async (item) => {
        try {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, images: true }
          })
          return {
            ...item,
            _sum: {
              quantity: parseInt(item.total_quantity),
              subtotal: parseFloat(item.total_subtotal)
            },
            _count: {
              productId: parseInt(item.product_count)
            },
            product
          }
        } catch (error) {
          console.error('Error fetching product details:', error)
          return {
            ...item,
            _sum: {
              quantity: parseInt(item.total_quantity),
              subtotal: parseFloat(item.total_subtotal)
            },
            _count: {
              productId: parseInt(item.product_count)
            },
            product: null
          }
        }
      })
    )

    // Calculate growth percentages
    const revenueGrowth = prevRevenue._sum.totalAmount 
      ? ((currentRevenue._sum.totalAmount || 0) - prevRevenue._sum.totalAmount) / prevRevenue._sum.totalAmount * 100
      : 0

    const ordersGrowth = prevOrders 
      ? (currentOrders - prevOrders) / prevOrders * 100
      : 0

    const customersGrowth = prevCustomers 
      ? (currentCustomers - prevCustomers) / prevCustomers * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          revenue: {
            current: currentRevenue._sum.totalAmount || 0,
            previous: prevRevenue._sum.totalAmount || 0,
            growth: revenueGrowth
          },
          orders: {
            current: currentOrders,
            previous: prevOrders,
            growth: ordersGrowth
          },
          customers: {
            current: currentCustomers,
            previous: prevCustomers,
            growth: customersGrowth
          },
          products: currentProducts
        },
        dailySales: [], // Simplified for now
        topProducts: topProductsWithDetails,
        recentOrders,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    })
  } catch (error) {
    console.error('Error in getOverviewReport:', error)
    throw error
  }
}

async function getSalesReport(startDate: Date, endDate: Date) {
  try {
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'PAID'
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, category: { select: { name: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const paymentMethods = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _sum: { totalAmount: true },
      _count: { paymentMethod: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'PAID',
        paymentMethod: { not: null }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        salesData,
        monthlyTrend: [], // Simplified
        paymentMethods,
        summary: {
          totalRevenue: salesData.reduce((sum, order) => sum + order.totalAmount, 0),
          totalOrders: salesData.length,
          averageOrderValue: salesData.length > 0 
            ? salesData.reduce((sum, order) => sum + order.totalAmount, 0) / salesData.length
            : 0
        }
      }
    })
  } catch (error) {
    console.error('Error in getSalesReport:', error)
    throw error
  }
}

async function getProductReport(startDate: Date, endDate: Date) {
  try {
    const productPerformance = await prisma.$queryRaw`
      SELECT 
        oi."productId",
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_subtotal,
        COUNT(oi."productId") as product_count
      FROM "public"."order_items" oi
      JOIN "public"."orders" o ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${startDate} 
        AND o."createdAt" <= ${endDate}
        AND o."paymentStatus" = 'PAID'
      GROUP BY oi."productId"
      ORDER BY total_subtotal DESC
    `
    
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        category: { select: { name: true } }
      },
      orderBy: { stock: 'asc' }
    })

    // Get product details
    const productsWithDetails = await Promise.all(
      (productPerformance as any[]).map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true }
        })
        return {
          ...item,
          product
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        productPerformance: productsWithDetails,
        categoryPerformance: [], // Simplified
        lowStockProducts,
        summary: {
          totalProducts: await prisma.product.count({ where: { isActive: true } }),
          soldProducts: productPerformance.length,
          totalRevenue: (productPerformance as any[]).reduce((sum, p) => sum + (parseFloat(p.total_subtotal) || 0), 0)
        }
      }
    })
  } catch (error) {
    console.error('Error in getProductReport:', error)
    throw error
  }
}

async function getCustomerReport(startDate: Date, endDate: Date) {
  try {
    const customerStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      where: { role: 'CUSTOMER' }
    })
    
    const topCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: { gte: startDate, lte: endDate },
            paymentStatus: 'PAID'
          }
        }
      },
      include: {
        orders: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
            paymentStatus: 'PAID'
          },
          select: {
            totalAmount: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })
    
    const newCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate customer spending
    const topCustomersWithSpending = topCustomers.map(customer => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        customerStats,
        topCustomers: topCustomersWithSpending,
        newCustomers,
        summary: {
          totalCustomers: await prisma.user.count({ where: { role: 'CUSTOMER' } }),
          newCustomers: newCustomers.length,
          activeCustomers: topCustomers.length
        }
      }
    })
  } catch (error) {
    console.error('Error in getCustomerReport:', error)
    throw error
  }
}