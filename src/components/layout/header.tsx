// src/components/layout/header.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Search, ShoppingCart, User, X, Heart, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"

// Navigation links
const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
]

// Category links for dropdown - now pointing to products with category filter
const categoryLinks = [
  { name: "Abaya", href: "/products?category=abaya" },
  { name: "Hijab & Kerudung", href: "/products?category=hijab" },
  { name: "Pashmina", href: "/products?category=pashmina" },
  { name: "Buku & Al-Qur'an", href: "/products?category=buku-islam" },
  { name: "Baju Anak", href: "/products?category=baju-anak" },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Get cart and wishlist data from stores
  const { getCartSummary } = useCartStore()
  const { getWishlistCount } = useWishlistStore()
  const cartSummary = getCartSummary()
  const wishlistCount = getWishlistCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      const searchParams = new URLSearchParams({ search: searchQuery.trim() })
      window.location.href = `/products?${searchParams.toString()}`
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm px-4">
        <p className="truncate sm:block">
          <span className="hidden sm:inline">🎉 Selamat datang di Azrafqueen Store - </span>
          <span>Fashion Islami Terpercaya dengan Gratis Ongkir!</span>
        </p>
      </div>
      
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-sm md:text-lg font-bold">AQ</span>
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-base bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Azrafqueen
              </span>
              <div className="text-xs text-muted-foreground -mt-1">
                Fashion Islami
              </div>
            </div>
            <div className="hidden sm:block lg:hidden">
              <span className="font-bold text-sm bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Azrafqueen
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-all hover:text-primary hover:bg-primary/5 px-2 xl:px-3 py-2 rounded-md whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium transition-all hover:text-primary hover:bg-primary/5 px-2 xl:px-3 py-2 rounded-md whitespace-nowrap">
                Categories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categoryLinks.map((category) => (
                <DropdownMenuItem key={category.name} asChild>
                  <Link href={category.href} className="w-full">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/products" className="w-full font-medium">
                  View All Products
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden xl:flex xl:w-1/3 xl:max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="pl-10 border-2 border-border hover:border-primary/30 focus:border-primary rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Search Icon - Mobile & Tablet */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Wishlist */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              )}
              <span className="sr-only">
                Wishlist ({wishlistCount} items)
              </span>
            </Link>
          </Button>

          {/* Cart with Drawer */}
          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartSummary.totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {cartSummary.totalItems > 99 ? '99+' : cartSummary.totalItems}
                </Badge>
              )}
              <span className="sr-only">
                Cart ({cartSummary.totalItems} items)
              </span>
            </Button>
          </CartDrawer>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/orders">Cek Pesanan</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">Kontak</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                {/* Header with logo and close button */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                      <span className="text-lg font-bold">AQ</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Azrafqueen
                      </h2>
                      <p className="text-xs text-muted-foreground -mt-1">Fashion Islami</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="space-y-1 p-4">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium text-gray-900 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                        >
                          {item.name === "Home" && <div className="h-2 w-2 rounded-full bg-primary mr-3" />}
                          {item.name === "Products" && <div className="h-2 w-2 rounded-full bg-green-500 mr-3" />}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Categories Section */}
                    <div className="pt-4">
                      <div className="px-4 py-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Kategori Produk
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {categoryLinks.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 ml-2"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60 mr-3" />
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="my-4 border-t" />
                    
                    {/* Quick Actions */}
                    <div className="space-y-1">
                      <Link
                        href="/wishlist"
                        className="flex items-center justify-between px-4 py-3 text-base font-medium text-gray-900 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 mr-3 text-red-500" />
                          Wishlist
                        </div>
                        {wishlistCount > 0 && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            {wishlistCount}
                          </Badge>
                        )}
                      </Link>
                      
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-900 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                      >
                        <ShoppingCart className="h-5 w-5 mr-3 text-blue-500" />
                        Cek Pesanan
                      </Link>
                      
                      <Link
                        href="/contact"
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-900 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                      >
                        <User className="h-5 w-5 mr-3 text-purple-500" />
                        Kontak
                      </Link>
                    </div>
                  </nav>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50/80 p-4">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile & Tablet Search Overlay */}
      {isSearchOpen && (
        <div className="border-t bg-background p-4 xl:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari abaya, hijab, atau produk lainnya..."
              className="pl-8 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  )
}