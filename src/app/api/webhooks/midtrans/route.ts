import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import crypto from 'crypto'

// Types for Midtrans notification
interface MidtransNotification {
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  merchant_id: string
  gross_amount: string
  fraud_status: string
  currency: string
  order_id: string
  payment_type: string
  signature_key: string
  status_code: string
  settlement_time?: string
}

// Verify Midtrans signature
function verifySignature(notification: MidtransNotification, serverKey: string): boolean {
  const expectedSignature = crypto
    .createHash('sha512')
    .update(
      notification.order_id +
        notification.status_code +
        notification.gross_amount +
        serverKey
    )
    .digest('hex')

  return notification.signature_key === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json()
    
    // Get Midtrans server key from environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is not configured')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify the notification signature
    if (!verifySignature(notification, serverKey)) {
      console.error('Invalid Midtrans notification signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Extract order number from order_id (assuming format: ORD-YYYYMMDD-XXXXXX)
    const orderNumber = notification.order_id

    // Find the order in the database
    const order = await prisma.order.findUnique({
      where: { orderNumber }
    })

    if (!order) {
      console.error(`Order not found: ${orderNumber}`)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Map Midtrans status to our PaymentStatus enum
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING
    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        paymentStatus = PaymentStatus.PAID
        break
      case 'deny':
      case 'cancel':
      case 'expire':
        paymentStatus = PaymentStatus.FAILED
        break
      case 'pending':
      default:
        paymentStatus = PaymentStatus.PENDING
        break
    }

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        // Optionally update payment method with specific Midtrans payment type
        paymentMethod: order.paymentMethod.includes('Midtrans') 
          ? order.paymentMethod 
          : `${order.paymentMethod} (${notification.payment_type})`
      }
    })

    console.log(`Order ${orderNumber} updated with payment status: ${paymentStatus}`)

    return NextResponse.json({
      success: true,
      message: 'Notification processed successfully',
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus
      }
    })

  } catch (error) {
    console.error('Error processing Midtrans notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process notification' },
      { status: 500 }
    )
  }
}

// Disable body parsing for this route as Midtrans sends raw body
export const config = {
  api: {
    bodyParser: false
  }
}