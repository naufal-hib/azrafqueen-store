import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
                variant: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const lastOrderDate = user.orders.length > 0 ? user.orders[0].createdAt : null

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        totalSpent,
        lastOrderDate
      }
    })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        image: data.image
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
      data: updatedUser,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        orders: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of users with orders
    if (existingUser.orders.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      )
    }

    // Don't allow deletion of admin users
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}