"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail,
  Edit,
  Trash2,
  User,
  Calendar,
  ShoppingBag,
  DollarSign,
  Crown,
  Shield
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

interface Customer {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  image: string | null
  createdAt: string
  updatedAt: string
  totalSpent: number
  lastOrderDate: string | null
  _count: {
    orders: number
  }
  orders?: any[]
}

export default function AdminCustomersPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [stats, setStats] = useState<Record<string, number>>({})

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/admin/customers?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setCustomers(result.data)
        setStats(result.stats)
      } else {
        setError('Failed to fetch customers')
      }
    } catch (err) {
      setError('Error loading customers')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [roleFilter, searchQuery])

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCustomers()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Handle view customer
  const handleViewCustomer = async (customer: Customer) => {
    try {
      // Fetch detailed customer data
      const response = await fetch(`/api/admin/customers/${customer.id}`)
      const result = await response.json()
      
      if (result.success) {
        setSelectedCustomer(result.data)
        setIsDetailModalOpen(true)
      } else {
        toast.error('Failed to load customer details')
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      toast.error('Failed to load customer details')
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async (customer: Customer) => {
    if (customer.role === 'ADMIN') {
      toast.error('Cannot delete admin users')
      return
    }

    if (customer._count.orders > 0) {
      toast.error('Cannot delete customers with existing orders')
      return
    }

    if (!confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Customer deleted successfully')
        await fetchCustomers()
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  // Get role badge
  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: { variant: 'default' as const, icon: Shield, color: 'text-blue-600' },
      CUSTOMER: { variant: 'secondary' as const, icon: User, color: 'text-gray-600' }
    }
    return variants[role as keyof typeof variants] || variants.CUSTOMER
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
            <h1 className="text-lg font-semibold">Customers Management</h1>
            <p className="text-sm text-muted-foreground">View and manage customer information</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-blue-600">{stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-green-600">{stats.customers || 0}</div>
              <p className="text-xs text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-purple-600">{stats.admins || 0}</div>
              <p className="text-xs text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 text-center">
              <div className="text-base font-bold text-orange-600">{stats.withOrders || 0}</div>
              <p className="text-xs text-muted-foreground">With Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Users className="h-4 w-4 mr-2" />
              All Customers ({customers.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Manage customer information and history
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
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No customers found' : 'No customers yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No customers match "${searchQuery}"`
                    : 'Customers will appear here when they register'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4">
                  {customers.map((customer) => (
                    <Card 
                      key={customer.id} 
                      className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{customer.name}</h3>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                          <Badge {...getRoleBadge(customer.role)} className="text-xs">
                            {customer.role}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="ml-1 font-medium">{customer._count.orders}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Spent:</span>
                            <span className="ml-1 font-medium">{formatCurrency(customer.totalSpent)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Joined: {new Date(customer.createdAt).toLocaleDateString()}
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
                        <TableHead>Customer</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow 
                          key={customer.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge {...getRoleBadge(customer.role)} className="text-xs">
                              {customer.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{customer._count.orders}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {customer.lastOrderDate 
                                ? new Date(customer.lastOrderDate).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(customer.createdAt).toLocaleDateString()}
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

        {/* Customer Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg">Customer Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    View customer information and order history
                  </DialogDescription>
                </div>
                {selectedCustomer && selectedCustomer.role !== 'ADMIN' && selectedCustomer._count.orders === 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCustomer(selectedCustomer)}
                    title="Delete Customer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>
            
            {selectedCustomer && (
              <div className="space-y-4">
                {/* Customer Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-medium">{selectedCustomer.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                      <Badge {...getRoleBadge(selectedCustomer.role)} className="text-xs mt-1">
                        {selectedCustomer.role}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Account Information</h4>
                      <div className="text-xs space-y-1">
                        <p><strong>Customer ID:</strong> {selectedCustomer.id}</p>
                        <p><strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                        <p><strong>Last Updated:</strong> {new Date(selectedCustomer.updatedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Order Statistics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                          <div className="text-base font-bold text-blue-600">{selectedCustomer._count.orders}</div>
                          <div className="text-xs text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg text-center">
                          <div className="text-base font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</div>
                          <div className="text-xs text-muted-foreground">Total Spent</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Last Activity</h4>
                      <div className="text-xs text-muted-foreground">
                        {selectedCustomer.lastOrderDate 
                          ? `Last order: ${new Date(selectedCustomer.lastOrderDate).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}`
                          : 'No orders yet'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Orders</h4>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCustomer.orders.slice(0, 5).map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell>
                                <div className="font-medium text-sm">{order.orderNumber}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{order.items?.length || 0} item(s)</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">{formatCurrency(order.totalAmount)}</div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}