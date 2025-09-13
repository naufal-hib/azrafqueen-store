"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Halaman Tidak Ditemukan</CardTitle>
            <CardDescription>
              Maaf, halaman yang Anda cari tidak dapat ditemukan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/" className="inline-flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products" className="inline-flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Lihat Produk
                </Link>
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Halaman Sebelumnya
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
