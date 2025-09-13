"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface ReportData {
  overview: {
    revenue: {
      current: number
      previous: number
      growth: number
    }
    orders: {
      current: number
      previous: number
      growth: number
    }
    customers: {
      current: number
      previous: number
      growth: number
    }
    products: number
  }
  dailySales: any[]
  topProducts: any[]
  recentOrders: any[]
  period: {
    start: string
    end: string
    days: number
  }
}

export default function AdminReportsPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("30")
  const [reportType, setReportType] = useState("overview")

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/reports?period=${period}&type=${reportType}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setReportData(result.data)
      } else {
        setError(result.error || 'Failed to fetch report data')
        toast.error(result.error || 'Failed to fetch report data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading report data'
      setError(errorMessage)
      console.error('Error fetching reports:', err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [period, reportType])

  // Export report data
  const handleExportReport = () => {
    if (!reportData) return

    const csvData = [
      ['Metric', 'Current Period', 'Previous Period', 'Growth %'],
      ['Revenue', reportData.overview.revenue.current, reportData.overview.revenue.previous, reportData.overview.revenue.growth.toFixed(2)],
      ['Orders', reportData.overview.orders.current, reportData.overview.orders.previous, reportData.overview.orders.growth.toFixed(2)],
      ['New Customers', reportData.overview.customers.current, reportData.overview.customers.previous, reportData.overview.customers.growth.toFixed(2)],
      ['Active Products', reportData.overview.products, '-', '-']
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Report exported successfully')
  }

  // Get growth indicator
  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return {
        icon: ArrowUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        variant: 'default' as const
      }
    } else if (growth < 0) {
      return {
        icon: ArrowDown,
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        variant: 'destructive' as const
      }
    } else {
      return {
        icon: Activity,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        variant: 'secondary' as const
      }
    }
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
            <h1 className="text-lg font-semibold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Business insights and performance metrics</p>
          </div>
          <Button size="sm" onClick={handleExportReport} disabled={!reportData}>
            <Download className="h-3 w-3 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchReportData}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : reportData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-base font-bold">{formatCurrency(reportData.overview.revenue.current)}</p>
                    </div>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  {reportData.overview.revenue.growth !== 0 && (
                    <div className="flex items-center mt-2">
                      {(() => {
                        const { icon: Icon, color, variant } = getGrowthIndicator(reportData.overview.revenue.growth)
                        return (
                          <>
                            <Icon className={`h-3 w-3 ${color} mr-1`} />
                            <Badge variant={variant} className="text-xs">
                              {Math.abs(reportData.overview.revenue.growth).toFixed(1)}%
                            </Badge>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="text-base font-bold">{reportData.overview.orders.current}</p>
                    </div>
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  {reportData.overview.orders.growth !== 0 && (
                    <div className="flex items-center mt-2">
                      {(() => {
                        const { icon: Icon, color, variant } = getGrowthIndicator(reportData.overview.orders.growth)
                        return (
                          <>
                            <Icon className={`h-3 w-3 ${color} mr-1`} />
                            <Badge variant={variant} className="text-xs">
                              {Math.abs(reportData.overview.orders.growth).toFixed(1)}%
                            </Badge>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">New Customers</p>
                      <p className="text-base font-bold">{reportData.overview.customers.current}</p>
                    </div>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  {reportData.overview.customers.growth !== 0 && (
                    <div className="flex items-center mt-2">
                      {(() => {
                        const { icon: Icon, color, variant } = getGrowthIndicator(reportData.overview.customers.growth)
                        return (
                          <>
                            <Icon className={`h-3 w-3 ${color} mr-1`} />
                            <Badge variant={variant} className="text-xs">
                              {Math.abs(reportData.overview.customers.growth).toFixed(1)}%
                            </Badge>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Products</p>
                      <p className="text-base font-bold">{reportData.overview.products}</p>
                    </div>
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            {reportData.topProducts && reportData.topProducts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Top Selling Products
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Best performing products in selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.topProducts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-muted-foreground">
                              {item._sum?.quantity || 0} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(item._sum?.subtotal || 0)}</p>
                          <p className="text-xs text-muted-foreground">{item._count?.productId || 0} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Orders */}
            {reportData.recentOrders && reportData.recentOrders.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Latest orders in selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{order.orderNumber}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{order.customerName}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{formatCurrency(order.totalAmount)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {order.status}
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
                </CardContent>
              </Card>
            )}

            {/* Period Info */}
            <Card>
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Report Period: {new Date(reportData.period.start).toLocaleDateString()} - {new Date(reportData.period.end).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reportData.period.days} days of data
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground">
              No data found for the selected period and report type.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}