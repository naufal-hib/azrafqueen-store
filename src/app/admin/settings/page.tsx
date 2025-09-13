"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Settings, 
  Save, 
  User, 
  Store, 
  Globe, 
  Upload, 
  Phone, 
  Mail, 
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAdmin } from "@/hooks/use-admin"
import { toast } from "sonner"

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

export default function AdminSettingsPage() {
  const { isLoading: authLoading } = useAdmin()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    storeName: "",
    storeSlogan: "",
    storeLogo: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    whatsappUrl: "",
    returnPolicy: "",
    shippingPolicy: "",
    privacyPolicy: "",
    termsOfService: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    currency: "IDR",
    timeZone: "Asia/Jakarta",
    isMaintenanceMode: false
  })

  // Fetch settings data
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        const data = result.data
        setSettings(data)
        setFormData({
          storeName: data.storeName || "",
          storeSlogan: data.storeSlogan || "",
          storeLogo: data.storeLogo || "",
          storeEmail: data.storeEmail || "",
          storePhone: data.storePhone || "",
          storeAddress: data.storeAddress || "",
          instagramUrl: data.instagramUrl || "",
          facebookUrl: data.facebookUrl || "",
          tiktokUrl: data.tiktokUrl || "",
          whatsappUrl: data.whatsappUrl || "",
          returnPolicy: data.returnPolicy || "",
          shippingPolicy: data.shippingPolicy || "",
          privacyPolicy: data.privacyPolicy || "",
          termsOfService: data.termsOfService || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          metaKeywords: data.metaKeywords || "",
          currency: data.currency || "IDR",
          timeZone: data.timeZone || "Asia/Jakarta",
          isMaintenanceMode: data.isMaintenanceMode || false
        })
      } else {
        toast.error(result.error || 'Failed to load settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formData.storeName?.trim()) {
        toast.error('Store name is required')
        return
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
        toast.success('Settings saved successfully')
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('files', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data?.files?.length > 0) {
        const filename = result.data.files[0]
        const logoUrl = `/uploads/${filename}`
        handleInputChange('storeLogo', logoUrl)
        toast.success('Logo uploaded successfully')
      } else {
        toast.error(result.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your store settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="store" className="space-y-4">
          <TabsList>
            <TabsTrigger value="store">Store Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Store Information
                </CardTitle>
                <CardDescription>
                  Basic store information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      placeholder="Enter store name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeSlogan">Store Slogan</Label>
                    <Input
                      id="storeSlogan"
                      value={formData.storeSlogan}
                      onChange={(e) => handleInputChange('storeSlogan', e.target.value)}
                      placeholder="Enter store slogan"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeLogo">Store Logo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="storeLogo"
                      value={formData.storeLogo}
                      onChange={(e) => handleInputChange('storeLogo', e.target.value)}
                      placeholder="Enter logo URL or upload file"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('logoUpload')?.click()}>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                    <input
                      id="logoUpload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  {formData.storeLogo && (
                    <div className="mt-2">
                      <img 
                        src={formData.storeLogo} 
                        alt="Store Logo Preview" 
                        className="h-16 w-16 object-contain border rounded" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      placeholder="IDR"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Input
                      id="timeZone"
                      value={formData.timeZone}
                      onChange={(e) => handleInputChange('timeZone', e.target.value)}
                      placeholder="Asia/Jakarta"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance"
                    checked={formData.isMaintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('isMaintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Store contact details for customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeEmail"
                      type="email"
                      value={formData.storeEmail}
                      onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                      placeholder="info@azrafqueen.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storePhone"
                      value={formData.storePhone}
                      onChange={(e) => handleInputChange('storePhone', e.target.value)}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-2" />
                    <Textarea
                      id="storeAddress"
                      value={formData.storeAddress}
                      onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                      placeholder="Enter complete store address"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Social Media Links
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/azrafqueen"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/azrafqueen"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappUrl">WhatsApp URL</Label>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsappUrl"
                      value={formData.whatsappUrl}
                      onChange={(e) => handleInputChange('whatsappUrl', e.target.value)}
                      placeholder="https://wa.me/6281234567890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktokUrl">TikTok URL</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tiktokUrl"
                      value={formData.tiktokUrl}
                      onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                      placeholder="https://tiktok.com/@azrafqueen"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Search engine optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="Azraf Queen Store - Premium Islamic Fashion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="Toko online terpercaya untuk fashion muslimah berkualitas premium"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Textarea
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                    placeholder="fashion muslimah, abaya, hijab, gamis, busana muslim"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Store Policies
                </CardTitle>
                <CardDescription>
                  Legal policies and terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea
                    id="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
                    placeholder="Enter return policy details..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                  <Textarea
                    id="shippingPolicy"
                    value={formData.shippingPolicy}
                    onChange={(e) => handleInputChange('shippingPolicy', e.target.value)}
                    placeholder="Enter shipping policy details..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                  <Textarea
                    id="privacyPolicy"
                    value={formData.privacyPolicy}
                    onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
                    placeholder="Enter privacy policy details..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsOfService">Terms of Service</Label>
                  <Textarea
                    id="termsOfService"
                    value={formData.termsOfService}
                    onChange={(e) => handleInputChange('termsOfService', e.target.value)}
                    placeholder="Enter terms of service details..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}