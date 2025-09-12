"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminOrdersPage() {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Process and manage customer orders</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter Status
          </Button>
        </div>

        {/* Orders Table Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Manage customer orders and track status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
              <p className="text-muted-foreground mb-6">
                This page will contain order processing functionality.<br />
                View, update, and manage customer orders.
              </p>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">23</div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">45</div>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-sm text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">156</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}