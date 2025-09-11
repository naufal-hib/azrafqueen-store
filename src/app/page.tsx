import Link from "next/link"
import { ArrowRight, ShoppingBag, Star, Users, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                ✨ Fashion Islami Terpercaya
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                Koleksi Fashion Islami
                <span className="text-primary"> Premium</span>
              </h1>
              <p className="text-xl text-muted-foreground lg:text-2xl">
                Temukan abaya, hijab, pashmina, dan perlengkapan ibadah berkualitas tinggi 
                untuk gaya hidup Islami yang elegan dan syari.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/category/abaya">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Belanja Sekarang
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/category">
                    Lihat Kategori
                    <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold lg:text-4xl">Kategori Produk</h2>
            <p className="text-muted-foreground lg:text-lg max-w-2xl mx-auto">
              Jelajahi koleksi lengkap fashion Islami dan perlengkapan ibadah 
              yang telah dipilih khusus untuk Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category Cards */}
            {[
              {
                name: "Abaya & Gamis",
                description: "Koleksi abaya dan gamis syari premium",
                href: "/category/abaya",
                badge: "Premium",
                items: "45+ Produk"
              },
              {
                name: "Hijab & Kerudung", 
                description: "Beragam model hijab dan kerudung cantik",
                href: "/category/hijab",
                badge: "Terlaris",
                items: "60+ Produk"
              },
              {
                name: "Pashmina",
                description: "Pashmina halus dan berkualitas tinggi",
                href: "/category/pashmina", 
                badge: "New",
                items: "25+ Produk"
              },
              {
                name: "Buku & Al-Qur'an",
                description: "Al-Qur'an dan literatur Islami",
                href: "/category/buku-islam",
                badge: "Lengkap",
                items: "30+ Produk"
              },
              {
                name: "Baju Muslim Anak",
                description: "Pakaian muslim untuk si buah hati",
                href: "/category/baju-anak",
                badge: "Lucu",
                items: "20+ Produk"
              },
              {
                name: "Aksesoris",
                description: "Aksesoris pelengkap gaya Islami",
                href: "/category/aksesoris",
                badge: "Soon",
                items: "Coming Soon"
              }
            ].map((category) => (
              <Card key={category.name} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.badge === "Premium" ? "default" : "secondary"}>
                      {category.badge}
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.items}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={category.href}>
                        Lihat Semua
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
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
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/category">
                      Jelajahi Produk
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Hubungi Kami
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