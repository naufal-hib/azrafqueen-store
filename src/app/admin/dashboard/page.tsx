"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdmin } from "@/hooks/use-admin"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  activeCustomers: number
  productGrowthPercentage?: number
  orderGrowthPercentage?: number
  revenueGrowthPercentage?: number
  customerGrowthPercentage?: number
  recentOrders: {
    id: string
    customer: string
    amount: number
    status: string
  }[]
  lowStockProducts: {
    name: string
    stock: number
  }[]
}

export default function AdminDashboardPage() {
  const { isLoading } = useAdmin()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setDashboardStats(data)
        } else {
          console.error('Failed to fetch dashboard stats')
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    
    fetchDashboardStats()
  }, [])

  if (isLoading || statsLoading || !dashboardStats) {
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Total Produk
              </CardTitle>
              <Package className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xl font-bold">{dashboardStats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.productGrowthPercentage ? `${dashboardStats.productGrowthPercentage > 0 ? '+' : ''}${dashboardStats.productGrowthPercentage}%` : 'N/A'} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Total Pesanan
              </CardTitle>
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xl font-bold">{dashboardStats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.orderGrowthPercentage ? `${dashboardStats.orderGrowthPercentage > 0 ? '+' : ''}${dashboardStats.orderGrowthPercentage}%` : 'N/A'} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Total Pendapatan
              </CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis" title={formatCurrency(dashboardStats?.totalRevenue || 0)}>
                {formatCurrency(dashboardStats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.revenueGrowthPercentage ? `${dashboardStats.revenueGrowthPercentage > 0 ? '+' : ''}${dashboardStats.revenueGrowthPercentage}%` : 'N/A'} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Pelanggan Aktif
              </CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xl font-bold">{dashboardStats?.activeCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.customerGrowthPercentage ? `${dashboardStats.customerGrowthPercentage > 0 ? '+' : ''}${dashboardStats.customerGrowthPercentage}%` : 'N/A'} dari bulan lalu
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
                Pesanan Terbaru
              </CardTitle>
              <CardDescription>
                Pesanan pelanggan terkini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats?.recentOrders && dashboardStats.recentOrders.length > 0 ? (
                  <>
                    {dashboardStats.recentOrders.map((order) => (
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
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => router.push('/admin/orders')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lihat Semua Pesanan
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Belum Ada Pesanan</h4>
                    <p className="text-xs text-muted-foreground">Pesanan akan muncul di sini setelah pelanggan melakukan pembelian</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Peringatan Stok Rendah
              </CardTitle>
              <CardDescription>
                Produk dengan stok menipis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats?.lowStockProducts && dashboardStats.lowStockProducts.length > 0 ? (
                  <>
                    {dashboardStats.lowStockProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Peringatan stok rendah</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {product.stock} tersisa
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => router.push('/admin/products')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Kelola Inventaris
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Stok Aman</h4>
                    <p className="text-xs text-muted-foreground">Semua produk memiliki stok yang cukup</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Tugas admin yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/admin/products/add')}
              >
                <Package className="h-6 w-6 mb-2" />
                <span>Tambah Produk</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/admin/orders')}
              >
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span>Proses Pesanan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/admin/customers')}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Lihat Pelanggan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto flex-col py-4 hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/admin/reports')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                <span>Laporan Penjualan</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}