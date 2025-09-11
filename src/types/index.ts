// Base types untuk aplikasi e-commerce

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: ProductCategory
  variants: ProductVariant[]
  stock: number
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  size?: string
  color?: string
  stock: number
  additionalPrice?: number
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

// Cart Types
export interface CartItem {
  id: string
  productId: string
  product: Product
  variantId?: string
  variant?: ProductVariant
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// Order Types
export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  variantId?: string
  variant?: ProductVariant
  quantity: number
  price: number
  subtotal: number
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

// Enum Types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// User Types (untuk admin dan optional customer)
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Form Types untuk checkout
export interface CheckoutFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: ShippingAddress
  paymentMethod: string
  notes?: string
}