// src/lib/checkout-schemas.ts
import { z } from "zod"

// Customer Information Schema
export const customerInfoSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
})

// Shipping Address Schema
export const shippingAddressSchema = z.object({
  name: z.string()
    .min(2, "Recipient name must be at least 2 characters")
    .max(50, "Recipient name must be less than 50 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  address: z.string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  city: z.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  province: z.string()
    .min(2, "Province must be selected"),
  postalCode: z.string()
    .min(5, "Postal code must be at least 5 digits")
    .max(10, "Postal code must be less than 10 digits")
    .regex(/^[0-9]+$/, "Postal code must contain only numbers"),
  notes: z.string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
})

// Payment Method Schema
export const paymentMethodSchema = z.object({
  method: z.enum(["bank_transfer", "qris", "cod", "midtrans"], {
    required_error: "Please select a payment method",
  }),
  bankAccount: z.string().optional(),
})

// Complete Checkout Schema
export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  sameAsCustomer: z.boolean().default(false),
  notes: z.string().max(1000, "Order notes must be less than 1000 characters").optional(),
})

// TypeScript Types
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Province Options for Indonesia
export const indonesianProvinces = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat", 
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
] as const

// Payment Methods Options
export const paymentMethods = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer to our bank account",
    icon: "🏦",
    processingTime: "Manual verification (1-24 hours)",
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR code with any e-wallet",
    icon: "📱",
    processingTime: "Instant verification",
  },
  {
    id: "midtrans",
    name: "Credit/Debit Card",
    description: "Pay with credit or debit card via Midtrans",
    icon: "💳",
    processingTime: "Instant verification",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive the item",
    icon: "💰",
    processingTime: "Available for certain areas",
  },
] as const