"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  CheckCircle, 
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Copy
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ErrorComponent } from "@/components/layout/error"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderItem {
  id: string
  productName: string
  variantInfo?: string
  quantity: number
  price: number
  subtotal: number
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
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

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: ShippingAddress
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod: string
  notes?: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Order not found')
        }

        if (result.data.orders.length === 0) {
          throw new Error('Order not found')
        }

        setOrder(result.data.orders[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <OrderConfirmationSkeleton />
        </div>
      </MainLayout>
    )
  }

  if (error || !order) {
    return (
      <MainLayout>
        <ErrorComponent
          title="Order Not Found"
          message={error || "The order you're looking for doesn't exist."}
          showHomeButton={true}
          showRetryButton={true}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'default'
      case 'CONFIRMED': return 'secondary'
      case 'PROCESSING': return 'secondary'
      case 'SHIPPED': return 'default'
      case 'DELIVERED': return 'secondary'
      case 'CANCELLED': return 'destructive'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'destructive'
      case 'PAID': return 'secondary'
      case 'FAILED': return 'destructive'
      case 'REFUNDED': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you an email confirmation shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {order.orderNumber}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyOrderNumber}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <div className="font-medium">
                      {formatDate(new Date(order.createdAt))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Status:</span>
                    <div>
                      <Badge variant={getStatusColor(order.status)} className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Status:</span>
                    <div>
                      <Badge variant={getPaymentStatusColor(order.paymentStatus)} className="mt-1">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>
                    <div className="font-medium">{order.paymentMethod}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            {order.paymentStatus === 'PENDING' && order.paymentMethod === 'Bank Transfer' && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Payment Instructions</h4>
                    <p>Please transfer the total amount to one of our bank accounts:</p>
                    <div className="bg-muted p-3 rounded text-sm space-y-1">
                      <div><strong>Bank BCA:</strong> 1234567890 (A.N. Azrafqueen Store)</div>
                      <div><strong>Bank Mandiri:</strong> 0987654321 (A.N. Azrafqueen Store)</div>
                      <div><strong>Amount:</strong> {formatCurrency(order.totalAmount)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      After transfer, please send proof of payment to our WhatsApp or email.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {order.paymentStatus === 'PENDING' && order.paymentMethod === 'QRIS' && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <h4 className="font-semibold">QRIS Payment</h4>
                    <p>Scan the QR code below with your e-wallet app:</p>
                    <div className="bg-muted p-4 rounded text-center">
                      <div className="w-32 h-32 bg-white mx-auto rounded border-2 border-dashed border-muted-foreground flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">QR Code</span>
                      </div>
                      <p className="text-sm mt-2">Amount: {formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.variantInfo && (
                          <p className="text-sm text-muted-foreground">{item.variantInfo}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>
                        {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-medium">{order.customerName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-medium">{order.customerEmail}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="font-medium">{order.customerPhone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-medium">{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.address}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </div>
                {order.shippingAddress.notes && (
                  <div className="text-muted-foreground">
                    Notes: {order.shippingAddress.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/category">
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/orders?email=${order.customerEmail}`}>
                    View Order History
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Loading skeleton
function OrderConfirmationSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}