"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Package,
  User,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdmin } from "@/hooks/use-admin"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface OrderItem {
  id: string
  productName: string
  variantInfo: string | null
  quantity: number
  price: number
  subtotal: number
  product: {
    id: string
    name: string
    images: string[]
  }
  variant: {
    id: string
    size: string | null
    color: string | null
  } | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: any
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: string | null
  trackingNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  user: {
    id: string
    name: string
    email: string
  } | null
}

export default function AdminOrdersPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [stats, setStats] = useState<Record<string, number>>({})

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/admin/orders?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setOrders(result.data)
        setStats(result.stats)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (err) {
      setError('Error loading orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, searchQuery])

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchOrders()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  // Handle update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paymentStatus: paymentStatus || undefined
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Order status updated successfully')
        await fetchOrders()
        setIsDetailModalOpen(false)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  // Handle delete order
  const handleDeleteOrder = async (order: Order) => {
    if (order.status !== 'PENDING') {
      toast.error('Can only delete pending orders')
      return
    }

    if (!confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Order deleted successfully')
        await fetchOrders()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      CONFIRMED: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
      PROCESSING: { variant: 'default' as const, icon: Package, color: 'text-blue-600' },
      SHIPPED: { variant: 'default' as const, icon: Truck, color: 'text-purple-600' },
      DELIVERED: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      CANCELLED: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    }
    return variants[status as keyof typeof variants] || variants.PENDING
  }

  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, color: 'text-yellow-600' },
      PAID: { variant: 'default' as const, color: 'text-green-600' },
      FAILED: { variant: 'destructive' as const, color: 'text-red-600' },
      REFUNDED: { variant: 'outline' as const, color: 'text-gray-600' }
    }
    return variants[status as keyof typeof variants] || variants.PENDING
  }

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Orders Management</h1>
            <p className="text-sm text-muted-foreground">Process and manage customer orders</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-yellow-600">{stats.PENDING || 0}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-blue-600">{stats.CONFIRMED || 0}</div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-blue-600">{stats.PROCESSING || 0}</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-purple-600">{stats.SHIPPED || 0}</div>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-green-600">{stats.DELIVERED || 0}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-red-600">{stats.CANCELLED || 0}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <ShoppingCart className="h-4 w-4 mr-2" />
              All Orders ({orders.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Manage customer orders and track status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No orders found' : 'No orders yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No orders match "${searchQuery}"`
                    : 'Orders will appear here when customers make purchases'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4">
                  {orders.map((order) => (
                    <Card 
                      key={order.id} 
                      className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{order.orderNumber}</h3>
                            <p className="text-xs text-muted-foreground">{order.customerName}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge {...getStatusBadge(order.status)} className="text-xs">
                              {order.status}
                            </Badge>
                            <Badge {...getPaymentBadge(order.paymentStatus)} className="text-xs">
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium mb-2">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{order.items.length} item(s)</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow 
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewOrder(order)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {order.id.slice(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{order.items.length} item(s)</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge {...getStatusBadge(order.status)} className="text-xs">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge {...getPaymentBadge(order.paymentStatus)} className="text-xs">
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg">Order Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    View and manage order information
                  </DialogDescription>
                </div>
                {selectedOrder && (
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedOrder.status} 
                      onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedOrder.status === 'PENDING' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteOrder(selectedOrder)}
                        title="Delete Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-medium">{selectedOrder.orderNumber}</h3>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Customer Information</h4>
                      <div className="text-xs space-y-1">
                        <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                        <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                        <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Shipping Address</h4>
                      <div className="text-xs text-muted-foreground">
                        {typeof selectedOrder.shippingAddress === 'string' 
                          ? selectedOrder.shippingAddress
                          : JSON.stringify(selectedOrder.shippingAddress, null, 2)
                        }
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Order Status</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge {...getStatusBadge(selectedOrder.status)} className="text-xs">
                          {selectedOrder.status}
                        </Badge>
                        <Badge {...getPaymentBadge(selectedOrder.paymentStatus)} className="text-xs">
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Payment & Shipping</h4>
                      <div className="text-xs space-y-1">
                        <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Not specified'}</p>
                        <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber || 'Not available'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Order Total</h4>
                      <div className="text-xs space-y-1">
                        <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                        <p><strong>Shipping:</strong> {formatCurrency(selectedOrder.shippingCost)}</p>
                        <p className="text-sm font-medium"><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{item.productName}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {item.variantInfo || 'Default'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{item.quantity}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatCurrency(item.price)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{formatCurrency(item.subtotal)}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}