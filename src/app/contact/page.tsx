"use client"

import Link from "next/link"
import { ChevronRight, Mail, Phone, MapPin, Clock, Instagram, Facebook, Youtube } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Contact Us</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            🌙 Hubungi Kami
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Kami Siap Membantu Anda
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tim customer service Azrafqueen Store siap melayani Anda dengan sepenuh hati. 
            Hubungi kami untuk konsultasi produk, bantuan pemesanan, atau pertanyaan lainnya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
              
              <div className="space-y-6">
                {/* Phone */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Telepon & WhatsApp</h3>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">
                            <a href="tel:+6281234567890" className="hover:text-primary transition-colors">
                              +62 812-3456-7890
                            </a>
                          </p>
                          <p className="text-muted-foreground">
                            <a href="https://wa.me/6281234567890" className="hover:text-primary transition-colors">
                              WhatsApp: +62 812-3456-7890
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">
                            <a href="mailto:hello@azrafqueen.com" className="hover:text-primary transition-colors">
                              hello@azrafqueen.com
                            </a>
                          </p>
                          <p className="text-muted-foreground">
                            <a href="mailto:support@azrafqueen.com" className="hover:text-primary transition-colors">
                              support@azrafqueen.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Alamat</h3>
                        <p className="text-muted-foreground">
                          Jl. Raya Islamic Centre No. 123<br />
                          Jakarta Selatan 12345<br />
                          Indonesia
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Jam Operasional</h3>
                        <div className="space-y-1 text-muted-foreground">
                          <p>Senin - Jumat: 09:00 - 18:00</p>
                          <p>Sabtu: 09:00 - 15:00</p>
                          <p>Minggu: Tutup</p>
                          <p className="text-primary font-medium mt-2">
                            * Customer service online 24/7 via WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Button variant="outline" size="lg" asChild>
                  <a 
                    href="https://instagram.com/azrafqueen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="h-5 w-5" />
                    Instagram
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a 
                    href="https://facebook.com/azrafqueen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-5 w-5" />
                    Facebook
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a 
                    href="https://youtube.com/@azrafqueen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Youtube className="h-5 w-5" />
                    YouTube
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions & FAQ */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Bantuan Cepat</h2>
              
              <div className="grid gap-4">
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Cek Status Pesanan
                    </CardTitle>
                    <CardDescription>
                      Lacak pesanan Anda dengan nomor invoice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/orders">
                        Cek Pesanan Saya
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Chat WhatsApp
                    </CardTitle>
                    <CardDescription>
                      Hubungi customer service langsung via WhatsApp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="secondary">
                      <a 
                        href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20bertanya%20tentang%20produk%20Azrafqueen%20Store"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat Sekarang
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Lihat Katalog
                    </CardTitle>
                    <CardDescription>
                      Jelajahi semua produk fashion Islami kami
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/products">
                        Lihat Semua Produk
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ Preview */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Pertanyaan Umum</h3>
              <div className="space-y-3 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Bagaimana cara memesan produk?</p>
                  <p className="text-muted-foreground">
                    Anda dapat memesan langsung melalui website atau menghubungi WhatsApp kami.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Apakah ada gratis ongkir?</p>
                  <p className="text-muted-foreground">
                    Ya, kami menyediakan gratis ongkir untuk seluruh Indonesia dengan syarat tertentu.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Berapa lama pengiriman?</p>
                  <p className="text-muted-foreground">
                    Pengiriman biasanya 2-5 hari kerja tergantung lokasi tujuan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Masih Ada Pertanyaan?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Tim customer service kami siap membantu Anda 24/7. 
                Jangan ragu untuk menghubungi kami kapan saja.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <a 
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat WhatsApp
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:hello@azrafqueen.com">
                    Kirim Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}