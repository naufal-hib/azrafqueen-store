"use client"

import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, MessageCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useStoreSettings } from "@/hooks/use-store-settings"

export function DynamicFooter() {
  const { settings } = useStoreSettings()
  const currentYear = new Date().getFullYear()

  // Default values if settings are loading or not available
  const storeName = settings?.storeName || "Azraf Queen Store"
  const storeAddress = settings?.storeAddress || "Jakarta, Indonesia"
  const storeEmail = settings?.storeEmail
  const storePhone = settings?.storePhone
  const instagramUrl = settings?.instagramUrl
  const facebookUrl = settings?.facebookUrl
  const whatsappUrl = settings?.whatsappUrl

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Company Info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">
                  {storeName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-bold">{storeName}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toko online terpercaya untuk fashion muslimah berkualitas premium. 
              Menyediakan abaya, hijab, pashmina, dan perlengkapan ibadah untuk 
              keluarga Muslim.
            </p>
            
            {/* Contact Info */}
            {(storeAddress || storeEmail || storePhone) && (
              <div className="space-y-2">
                {storeAddress && (
                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{storeAddress}</span>
                  </div>
                )}
                {storeEmail && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href={`mailto:${storeEmail}`} className="hover:text-primary transition-colors">
                      {storeEmail}
                    </a>
                  </div>
                )}
                {storePhone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${storePhone}`} className="hover:text-primary transition-colors">
                      {storePhone}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {/* Social Media */}
            <div className="flex space-x-3">
              {instagramUrl && (
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {facebookUrl && (
                <Link
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
              {whatsappUrl && (
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">WhatsApp</span>
                </Link>
              )}
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kategori Produk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/products?category=abaya" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Abaya & Gamis
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=hijab" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Hijab & Kerudung
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=pashmina" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pashmina
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=buku-islam" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Buku & Al-Qur&apos;an
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?category=baju-anak" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Baju Muslim Anak
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Layanan Customer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/orders" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Cek Status Pesanan
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed opacity-60">
                  FAQ (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="my-8" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} {storeName}. All rights reserved.
          </div>
          
          {/* Footer Links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
            <span className="text-muted-foreground cursor-not-allowed opacity-60">
              Privacy Policy (Coming Soon)
            </span>
            <span className="text-muted-foreground cursor-not-allowed opacity-60">
              Terms of Service (Coming Soon)
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}