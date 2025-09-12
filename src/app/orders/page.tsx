"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Package, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"

interface OrderItem {
  id: string
  productName: string
  variantInfo?: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderHistoryPage() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')

  const [email, setEmail] = useState(emailFromUrl || '')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!emailFromUrl)

  // Memoize handleSearch function untuk fix missing dependency
  const handleSearch = useCallback(async (searchEmail?: string) => {
    const emailToSearch = searchEmail || email
    if (!emailToSearch.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(emailToSearch)}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data.orders)
        setSearched(true)
      } else {
        console.error('Failed to fetch orders:', result.error)
        setOrders([])
        setSearched(true)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [email])

  // Auto-search if email from URL
  useEffect(() => {
    if (emailFromUrl) {
      handleSearch(emailFromUrl)
    }
  }, [emailFromUrl, handleSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Orders</h1>
          <p className="text-muted-foreground">
            Enter your email address to view your order history
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">Find Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Orders
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any orders associated with this email address.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Make sure you entered the correct email address, or
                    </p>
                    <Button asChild>
                      <Link href="/category">Start Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Your Orders ({orders.length})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Showing orders for: <strong>{email}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

// Order Card Component
interface OrderCardProps {
  order: Order
}

function OrderCard({ order }: OrderCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': 
      case 'PROCESSING': 
      case 'SHIPPED': return <Package className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
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
    <Card>
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Order #{order.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(new Date(order.createdAt))}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {formatCurrency(order.totalAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4">
          <Badge variant={getStatusColor(order.status)} className="gap-1">
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
          <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
            {order.paymentStatus}
          </Badge>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-2 mb-4">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.productName}</span>
                {item.variantInfo && (
                  <span className="text-muted-foreground ml-2">({item.variantInfo})</span>
                )}
              </div>
              <span className="text-muted-foreground">Qty: {item.quantity}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-sm text-muted-foreground">
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Payment: {order.paymentMethod}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/order-confirmation/${order.orderNumber}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}