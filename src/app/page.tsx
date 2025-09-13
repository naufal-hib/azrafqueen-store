"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Star, Users, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductGrid } from "@/components/product/product-grid"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  images: string[]
  category: {
    name: string
    slug: string
  }
  isFeatured: boolean
  stock: number
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  _count: {
    products: number
  }
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true)
        const response = await fetch('/api/products?featured=true&limit=8')
        const result = await response.json()
        
        if (result.success) {
          setFeaturedProducts(result.data.products)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetch('/api/categories')
        const result = await response.json()
        
        if (result.success) {
          setCategories(result.data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/8 via-background to-secondary/10 py-20 overflow-hidden">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-primary/20"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full border border-primary/15"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full border border-primary/10"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 rounded-full border-2 border-primary/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 font-elegant-body">
                🌙 Fashion Islami Terpercaya
              </Badge>
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-elegant-heading font-bold tracking-tight leading-[1.1] mb-2">
                <span className="hero-title">Koleksi Fashion</span>
                <br />
                <span className="hero-title">Islami Premium</span>
              </h1>
              <p className="text-xl lg:text-2xl xl:text-3xl font-elegant-body hero-subtitle text-muted-foreground/90 max-w-2xl leading-relaxed">
                Temukan abaya, hijab, pashmina, dan perlengkapan ibadah berkualitas tinggi 
                untuk gaya hidup Islami yang <em className="font-arabic text-primary/80 not-italic">elegan</em> dan syari.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row relative z-20 mt-8">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer font-elegant-body font-medium text-base px-8 py-4 h-auto"
                >
                  <Link 
                    href="/products" 
                    className="inline-flex items-center justify-center text-center no-underline cursor-pointer"
                  >
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Belanja Sekarang
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 cursor-pointer font-elegant-body font-medium text-base px-8 py-4 h-auto"
                >
                  <Link 
                    href="/products" 
                    className="inline-flex items-center justify-center text-center no-underline cursor-pointer"
                  >
                    Lihat Kategori
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">10K+ Customer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Gratis Ongkir</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="h-full w-full rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hero Image akan ditambahkan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="mb-2">Featured Products</Badge>
            <h2 className="text-3xl font-bold lg:text-4xl">Produk Unggulan</h2>
            <p className="text-muted-foreground lg:text-lg max-w-2xl mx-auto">
              Produk pilihan terbaik dengan kualitas premium dan design yang elegan
            </p>
          </div>
          
          <ProductGrid
            products={featuredProducts}
            isLoading={loadingProducts}
            emptyMessage="Belum ada produk unggulan saat ini"
            className="mb-8"
          />

          {featuredProducts.length > 0 && (
            <div className="text-center">
              <Button variant="outline" size="lg" asChild className="hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                <Link href="/products" className="inline-flex items-center">
                  Lihat Semua Produk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold lg:text-4xl">Kategori Produk</h2>
            <p className="text-muted-foreground lg:text-lg max-w-2xl mx-auto">
              Jelajahi koleksi lengkap fashion Islami dan perlengkapan ibadah 
              yang telah dipilih khusus untuk Anda
            </p>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary">
                        {category._count.products} Produk
                      </Badge>
                    </div>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category._count.products === 0 
                          ? 'Coming Soon' 
                          : `${category._count.products} produk tersedia`
                        }
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products?category=${category.slug}`}>
                          Lihat Semua
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold lg:text-4xl">Mengapa Pilih Azrafqueen?</h2>
            <p className="text-muted-foreground lg:text-lg max-w-2xl mx-auto">
              Kami berkomitmen memberikan pelayanan terbaik dengan produk berkualitas tinggi
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Kualitas Premium",
                description: "Semua produk telah melalui quality control ketat"
              },
              {
                icon: Truck,
                title: "Pengiriman Cepat",
                description: "Gratis ongkir seluruh Indonesia dengan expedisi terpercaya"
              },
              {
                icon: Users,
                title: "Customer Service",
                description: "Tim support yang ramah dan siap membantu 24/7"
              },
              {
                icon: Star,
                title: "Trusted Brand",
                description: "Dipercaya oleh ribuan customer di seluruh Indonesia"
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
            <CardContent className="relative p-8 lg:p-12">
              <div className="text-center space-y-6 text-white">
                <h2 className="text-3xl font-bold lg:text-4xl">
                  Mulai Belanja Fashion Islami Hari Ini
                </h2>
                <p className="text-primary-foreground/90 lg:text-lg max-w-2xl mx-auto">
                  Dapatkan koleksi terbaru dengan harga terbaik. 
                  Daftar newsletter untuk mendapat info promo dan produk terbaru.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" variant="secondary" asChild className="hover:bg-white/90 transition-all duration-300">
                    <Link href="/products" className="inline-flex items-center">
                      Jelajahi Produk
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary transition-all duration-300" asChild>
                    <Link href="/contact" className="inline-flex items-center">
                      Hubungi Kami
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  )
}