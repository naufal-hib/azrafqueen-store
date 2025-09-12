"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  Bell,
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { signOut } from "next-auth/react"


// Mock data - nanti akan diganti dengan data real dari database
const mockStats = {
  totalProducts: 156,
  totalOrders: 89,
  totalRevenue: 45250000,
  activeCustomers: 234,
  recentOrders: [
    { id: "ORD-001", customer: "Siti Aminah", amount: 250000, status: "PENDING" },
    { id: "ORD-002", customer: "Fatimah Zahra", amount: 175000, status: "CONFIRMED" },
    { id: "ORD-003", customer: "Khadijah Ali", amount: 320000, status: "SHIPPED" },
  ],
  lowStockProducts: [
    { name: "Abaya Dubai Premium", stock: 3 },
    { name: "Hijab Voal Polos", stock: 5 },
    { name: "Pashmina Crinkle", stock: 2 },
  ]
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/admin/login")
      return
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/admin/login")
      return
    }

    setLoading(false)
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground mr-3">
                <span className="text-sm font-bold">AQ</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  Welcome back, {session?.user?.name}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
  <Button variant="ghost" size="icon">
    <Bell className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon">
    <Settings className="h-4 w-4" />
  </Button>
  <Button 
    variant="outline" 
    onClick={() => router.push("/")}
  >
    View Store
  </Button>
  <Button 
    variant="destructive" 
    size="sm"
    onClick={() => signOut({ callbackUrl: "/admin/login" })}
  >
    Logout
  </Button>
</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(mockStats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  Latest customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
                        <Badge 
                          variant={
                            order.status === 'PENDING' ? 'destructive' :
                            order.status === 'CONFIRMED' ? 'secondary' :
                            'default'
                          }
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  Products running low on inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStats.lowStockProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Low stock warning</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {product.stock} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    Manage Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common admin tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Package className="h-6 w-6 mb-2" />
                  <span>Add Product</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span>Process Orders</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Users className="h-6 w-6 mb-2" />
                  <span>View Customers</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Sales Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Development Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-blue-800">
                  <strong>Development Mode:</strong> This dashboard displays mock data. 
                  Real functionality will be implemented in the next phases.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}