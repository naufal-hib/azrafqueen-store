// src/store/wishlist-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string // Product ID
  productId: string
  productName: string
  productSlug: string
  productImage: string
  basePrice: number
  discountPrice?: number
  category: {
    name: string
    slug: string
  }
  dateAdded: string // ISO date string
}

interface WishlistState {
  items: WishlistItem[]
  
  // Actions
  addItem: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  toggleItem: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => boolean // Returns true if added, false if removed
  
  // Computed values
  isInWishlist: (productId: string) => boolean
  getWishlistCount: () => number
  getWishlistItem: (productId: string) => WishlistItem | undefined
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Check if item already exists
          const existingItem = state.items.find(item => item.productId === newItem.productId)
          
          if (existingItem) {
            // Item already exists, don't add duplicate
            return state
          }
          
          // Add new item
          const wishlistItem: WishlistItem = {
            ...newItem,
            id: newItem.productId,
            dateAdded: new Date().toISOString()
          }
          
          return { items: [...state.items, wishlistItem] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }))
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      toggleItem: (item) => {
        const state = get()
        const isCurrentlyInWishlist = state.isInWishlist(item.productId)
        
        if (isCurrentlyInWishlist) {
          state.removeItem(item.productId)
          return false // Removed
        } else {
          state.addItem(item)
          return true // Added
        }
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId)
      },

      getWishlistCount: () => {
        return get().items.length
      },

      getWishlistItem: (productId) => {
        return get().items.find(item => item.productId === productId)
      }
    }),
    {
      name: 'azrafqueen-wishlist', // localStorage key
    }
  )
)