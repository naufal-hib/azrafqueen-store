import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          
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
                  href="/category/abaya" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Abaya & Gamis
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/hijab" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Hijab & Kerudung
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/pashmina" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pashmina
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/buku-islam" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Buku & Al-Qur'an
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/baju-anak" 
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
                  href="/shipping" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Info Pengiriman
                </Link>
              </li>
              <li>
                <Link 
                  href="/returns" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Kebijakan Return
                </Link>
              </li>
              <li>
                <Link 
                  href="/size-guide" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Panduan Ukuran
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kontak Kami</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">
                  Jl. Raya Islamic Centre No. 123<br />
                  Jakarta Selatan 12345
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Link 
                  href="tel:+6281234567890"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +62 812-3456-7890
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Link 
                  href="mailto:hello@azrafqueen.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  hello@azrafqueen.com
                </Link>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Jam Operasional
              </h4>
              <div className="text-sm text-muted-foreground">
                <p>Senin - Jumat: 09:00 - 18:00</p>
                <p>Sabtu: 09:00 - 15:00</p>
                <p>Minggu: Tutup</p>
              </div>
            </div>
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
              href="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Payment Methods & Security */}
        <Separator className="my-6" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Metode Pembayaran yang Aman
          </p>
          <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
            <span>Bank Transfer</span>
            <span>•</span>
            <span>QRIS</span>
            <span>•</span>
            <span>E-Wallet</span>
            <span>•</span>
            <span>Midtrans</span>
          </div>
        </div>
      </div>
    </footer>
  )
}