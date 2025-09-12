"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, CreditCard, Lock, ArrowLeft } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCartStore, type CartItem, type CartSummary } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"
import { 
  checkoutSchema, 
  type CheckoutFormData,
  indonesianProvinces,
  paymentMethods 
} from "@/lib/checkout-schemas"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartSummary, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sameAsCustomer, setSameAsCustomer] = useState(false)
  
  const cartSummary = getCartSummary()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  // Form setup
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerInfo: {
        name: "",
        email: "",
        phone: "",
      },
      shippingAddress: {
        name: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        notes: "",
      },
      paymentMethod: {
        method: "bank_transfer",
      },
      sameAsCustomer: false,
      notes: "",
    },
  })

  // Watch customer info to auto-fill shipping address
  const customerInfo = form.watch("customerInfo")

  // Handle same as customer checkbox
  const handleSameAsCustomer = (checked: boolean) => {
    setSameAsCustomer(checked)
    form.setValue("sameAsCustomer", checked)
    
    if (checked && customerInfo) {
      form.setValue("shippingAddress.name", customerInfo.name || "")
      form.setValue("shippingAddress.phone", customerInfo.phone || "")
    }
  }

  // Submit form
  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    
    try {
      // Prepare order data
      const orderData = {
        customerInfo: data.customerInfo,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variant?.id,
          variantInfo: item.variant ? 
            `${item.variant.size ? `Size: ${item.variant.size}` : ''}${item.variant.size && item.variant.color ? ', ' : ''}${item.variant.color ? `Color: ${item.variant.color}` : ''}`.trim() : 
            null,
          quantity: item.quantity,
          price: item.basePrice + (item.variant?.additionalPrice || 0),
          subtotal: item.subtotal,
        })),
        subtotal: cartSummary.subtotal,
        shippingCost: cartSummary.shipping,
        totalAmount: cartSummary.total,
        notes: data.notes,
      }

      // Submit to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/order-confirmation/${result.data.orderNumber}`)
      } else {
        throw new Error(result.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // TODO: Show error toast/notification
      alert('Failed to process order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render if cart is empty
  if (items.length === 0) {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Button variant="outline" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Forms */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="08123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="customerInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsCustomer"
                      checked={sameAsCustomer}
                      onCheckedChange={handleSameAsCustomer}
                    />
                    <label htmlFor="sameAsCustomer" className="text-sm font-medium">
                      Same as customer information
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Recipient full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="08123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingAddress.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Street address, building, apartment, floor, etc."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="City name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress.province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {indonesianProvinces.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingAddress.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes for delivery (e.g., landmark, building color, etc.)"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod.method"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4"
                          >
                            {paymentMethods.map((method) => (
                              <div key={method.id} className="flex items-center space-x-3">
                                <RadioGroupItem value={method.id} id={method.id} />
                                <label 
                                  htmlFor={method.id} 
                                  className="flex-1 cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{method.icon}</span>
                                    <div className="flex-1">
                                      <div className="font-medium">{method.name}</div>
                                      <div className="text-sm text-muted-foreground">{method.description}</div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {method.processingTime}
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions for your order..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummaryCard 
                items={items}
                cartSummary={cartSummary}
                isSubmitting={isSubmitting}
              />
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  )
}

// Order Summary Component
interface OrderSummaryCardProps {
  items: CartItem[]
  cartSummary: CartSummary
  isSubmitting: boolean
}

function OrderSummaryCard({ items, cartSummary, isSubmitting }: OrderSummaryCardProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 py-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2">
                  {item.productName}
                </h4>
                {item.variant && (
                  <div className="text-xs text-muted-foreground">
                    {item.variant.size && `Size: ${item.variant.size}`}
                    {item.variant.size && item.variant.color && ', '}
                    {item.variant.color && `Color: ${item.variant.color}`}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </div>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({cartSummary.totalItems} items)</span>
            <span>{formatCurrency(cartSummary.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {cartSummary.shipping === 0 ? (
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              ) : (
                formatCurrency(cartSummary.shipping)
              )}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(cartSummary.total)}</span>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing Order...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Place Order
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Secure Checkout</span>
          </div>
          <p>Your payment and personal information are secure.</p>
        </div>
      </CardContent>
    </Card>
  )
}