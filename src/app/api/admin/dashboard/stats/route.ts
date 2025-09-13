import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get current month and previous month dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Get product stats with growth calculation
    const [totalProducts, currentMonthProducts, previousMonthProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          createdAt: {
            gte: currentMonthStart
          }
        }
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart
          }
        }
      })
    ])
    
    // Calculate product growth percentage
    const productGrowthPercentage = previousMonthProducts > 0 
      ? Math.round(((currentMonthProducts - previousMonthProducts) / previousMonthProducts) * 100)
      : currentMonthProducts > 0 ? 100 : 0
    
    // Initialize other stats (since Order/User tables may not exist yet)
    let totalOrders = 0
    let totalRevenue = 0
    let activeCustomers = 0
    let orderGrowthPercentage = 0
    let revenueGrowthPercentage = 0
    let customerGrowthPercentage = 0
    let recentOrders: any[] = []
    
    // Try to get order/user data if tables exist
    try {
      const [ordersData, revenueData, customersData, recentOrdersData] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: {
            totalAmount: true
          },
          where: {
            paymentStatus: "PAID"
          }
        }),
        prisma.user.count(),
        prisma.order.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        })
      ])
      
      totalOrders = ordersData
      totalRevenue = revenueData._sum.totalAmount || 0
      activeCustomers = customersData
      recentOrders = recentOrdersData.map(order => ({
        id: order.orderNumber,
        customer: order.customerName,
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }))
      
    } catch (error) {
      // Tables don't exist yet, use default values
      console.log('Order/User tables not found, using default values')
    }
    
    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
          gt: 0
        }
      },
      take: 5,
      orderBy: { stock: 'asc' },
      select: {
        name: true,
        stock: true
      }
    })

    // Format data untuk dashboard
    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      activeCustomers,
      productGrowthPercentage,
      orderGrowthPercentage,
      revenueGrowthPercentage,
      customerGrowthPercentage,
      recentOrders,
      lowStockProducts: lowStockProducts.map(product => ({
        name: product.name,
        stock: product.stock
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}