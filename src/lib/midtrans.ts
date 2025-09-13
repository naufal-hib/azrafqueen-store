import midtransClient from 'midtrans-client'
import { env } from '@/env.mjs'

// Initialize Midtrans client
const midtrans = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY
})

/**
 * Create a Midtrans payment transaction
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Unique order ID
 * @param {number} params.amount - Payment amount in IDR
 * @param {Object} params.customerDetails - Customer information
 * @param {Array} params.items - Order items
 * @returns {Promise<Object>} - Transaction response
 */
export async function createMidtransTransaction(params: {
  orderId: string
  amount: number
  customerDetails: {
    firstName: string
    lastName?: string
    email: string
    phone: string
    billingAddress?: {
      firstName: string
      lastName?: string
      email: string
      phone: string
      address: string
      city: string
      postalCode: string
      countryCode: string
    }
    shippingAddress?: {
      firstName: string
      lastName?: string
      email: string
      phone: string
      address: string
      city: string
      postalCode: string
      countryCode: string
    }
  }
  items: Array<{
    id: string
    price: number
    quantity: number
    name: string
    brand?: string
    category?: string
  }>
}) {
  try {
    // Prepare transaction parameters
    const transactionParams = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount
      },
      customer_details: params.customerDetails,
      item_details: params.items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
        brand: item.brand || 'Azrafqueen Store',
        category: item.category || 'Fashion'
      })),
      credit_card: {
        secure: true
      }
    }

    // Create transaction
    const snapResponse = await midtrans.createTransaction(transactionParams)
    return snapResponse
  } catch (error) {
    console.error('Midtrans transaction error:', error)
    throw new Error('Failed to create Midtrans transaction')
  }
}

/**
 * Get Midtrans client key for frontend
 * @returns {string} - Client key
 */
export function getMidtransClientKey(): string {
  return env.MIDTRANS_CLIENT_KEY
}

/**
 * Check if Midtrans is properly configured
 * @returns {boolean} - Configuration status
 */
export function isMidtransConfigured(): boolean {
  return !!(
    env.MIDTRANS_SERVER_KEY &&
    env.MIDTRANS_CLIENT_KEY &&
    env.MIDTRANS_IS_PRODUCTION !== undefined
  )
}