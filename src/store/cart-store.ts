// src/store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for cart items
export interface CartVariant {
  id: string
  size?: string
  color?: string
  additionalPrice: number
}

export interface CartItem {
  id: string // Unique cart item ID (product + variant combination)
  productId: string
  productName: string
  productSlug: string
  productImage: string
  basePrice: number
  quantity: number
  variant?: CartVariant
  subtotal: number // quantity * (basePrice + variant.additionalPrice)
}

export interface CartSummary {
  itemCount: number
  totalItems: number // Total quantity across all items
  subtotal: number
  shipping: number
  total: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  
  // Computed values
  getCartSummary: () => CartSummary
  getCartItem: (productId: string, variantId?: string) => CartItem | undefined
}

// Helper function to generate unique cart item ID
const generateCartItemId = (productId: string, variantId?: string): string => {
  return variantId ? `${productId}-${variantId}` : productId
}

// Helper function to calculate subtotal
const calculateSubtotal = (basePrice: number, quantity: number, variantPrice: number = 0): number => {
  return quantity * (basePrice + variantPrice)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const variantId = newItem.variant?.id
        const itemId = generateCartItemId(newItem.productId, variantId)
        
        set((state) => {
          const existingItem = state.items.find(item => item.id === itemId)
          
          if (existingItem) {
            // Update existing item quantity
            const updatedItems = state.items.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity + newItem.quantity,
                    subtotal: calculateSubtotal(
                      item.basePrice,
                      item.quantity + newItem.quantity,
                      item.variant?.additionalPrice || 0
                    )
                  }
                : item
            )
            return { items: updatedItems }
          } else {
            // Add new item
            const cartItem: CartItem = {
              ...newItem,
              id: itemId,
              subtotal: calculateSubtotal(
                newItem.basePrice,
                newItem.quantity,
                newItem.variant?.additionalPrice || 0
              )
            }
            return { items: [...state.items, cartItem] }
          }
        })
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  subtotal: calculateSubtotal(
                    item.basePrice,
                    quantity,
                    item.variant?.additionalPrice || 0
                  )
                }
              : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      setCartOpen: (open) => {
        set({ isOpen: open })
      },

      getCartSummary: () => {
        const items = get().items
        const itemCount = items.length
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
        
        // TODO: Calculate shipping cost based on weight/location
        const shipping = subtotal > 250000 ? 0 : 15000 // Free shipping above 250k
        const total = subtotal + shipping

        return {
          itemCount,
          totalItems,
          subtotal,
          shipping,
          total
        }
      },

      getCartItem: (productId, variantId) => {
        const itemId = generateCartItemId(productId, variantId)
        return get().items.find(item => item.id === itemId)
      }
    }),
    {
      name: 'azrafqueen-cart', // localStorage key
      // Only persist items, not UI state like isOpen
      partialize: (state) => ({ items: state.items })
    }
  )
)