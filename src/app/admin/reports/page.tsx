"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BarChart3, Download, Calendar, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminReportsPage() {
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
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Business insights and performance metrics</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Sales Report
              </CardTitle>
              <CardDescription>Revenue and sales analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Product Performance
              </CardTitle>
              <CardDescription>Top selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Insights
              </CardTitle>
              <CardDescription>Customer behavior data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Report Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Comprehensive business analytics and reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reports & Analytics</h3>
              <p className="text-muted-foreground mb-6">
                This page will contain detailed analytics and reporting features.<br />
                Charts, graphs, and business intelligence tools.
              </p>
              <Button>View Sample Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}