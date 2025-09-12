"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tags, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminCategoriesPage() {
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
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="text-muted-foreground">Organize your products with categories</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-10" />
        </div>

        {/* Categories Grid Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tags className="h-5 w-5 mr-2" />
              Product Categories
            </CardTitle>
            <CardDescription>
              Manage product categories and organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Categories Management</h3>
              <p className="text-muted-foreground mb-6">
                This page will contain category management functionality.<br />
                Create, edit, and organize product categories.
              </p>
              <Button>Create First Category</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}