import { useState, useEffect } from 'react'

interface StoreSettings {
  id: string
  storeName: string
  storeSlogan?: string
  storeLogo?: string
  storeEmail?: string
  storePhone?: string
  storeAddress?: string
  instagramUrl?: string
  facebookUrl?: string
  tiktokUrl?: string
  whatsappUrl?: string
  returnPolicy?: string
  shippingPolicy?: string
  privacyPolicy?: string
  termsOfService?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  currency: string
  timeZone: string
  isMaintenanceMode: boolean
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        setError(result.error || 'Failed to fetch settings')
      }
    } catch (err) {
      setError('Failed to load store settings')
      console.error('Error fetching store settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  }
}