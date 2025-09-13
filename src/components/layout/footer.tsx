import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">AQ</span>
              </div>
              <span className="font-bold">Azrafqueen Store</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toko online terpercaya untuk fashion Islami berkualitas premium. 
              Menyediakan abaya, hijab, pashmina, dan perlengkapan ibadah untuk 
              keluarga Muslim.
            </p>
            <div className="flex space-x-3">
              <Link
                href="https://instagram.com/azrafqueen"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://facebook.com/azrafqueen"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://youtube.com/@azrafqueen"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
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
            © {currentYear} Azrafqueen Store. All rights reserved.
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