import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch store settings
export async function GET() {
  try {
    // Try to get existing settings (there should only be one record)
    let settings = await prisma.storeSettings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeName: "Azraf Queen Store",
          storeSlogan: "Premium Islamic Fashion & Lifestyle",
          storeEmail: "info@azrafqueen.com",
          storePhone: "+62 812-3456-7890",
          storeAddress: "Jakarta, Indonesia",
          metaTitle: "Azraf Queen Store - Premium Islamic Fashion",
          metaDescription: "Toko online terpercaya untuk fashion muslimah berkualitas premium",
          metaKeywords: "fashion muslimah, abaya, hijab, gamis, busana muslim",
          currency: "IDR",
          timeZone: "Asia/Jakarta"
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store settings' },
      { status: 500 }
    )
  }
}

// PUT - Update store settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.storeName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Store name is required' },
        { status: 400 }
      )
    }
    
    // Get existing settings or create if none exist
    let settings = await prisma.storeSettings.findFirst()
    
    if (!settings) {
      // Create new settings
      settings = await prisma.storeSettings.create({
        data: {
          storeName: data.storeName,
          storeSlogan: data.storeSlogan || null,
          storeLogo: data.storeLogo || null,
          storeEmail: data.storeEmail || null,
          storePhone: data.storePhone || null,
          storeAddress: data.storeAddress || null,
          instagramUrl: data.instagramUrl || null,
          facebookUrl: data.facebookUrl || null,
          tiktokUrl: data.tiktokUrl || null,
          whatsappUrl: data.whatsappUrl || null,
          returnPolicy: data.returnPolicy || null,
          shippingPolicy: data.shippingPolicy || null,
          privacyPolicy: data.privacyPolicy || null,
          termsOfService: data.termsOfService || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          metaKeywords: data.metaKeywords || null,
          currency: data.currency || "IDR",
          timeZone: data.timeZone || "Asia/Jakarta",
          isMaintenanceMode: data.isMaintenanceMode || false
        }
      })
    } else {
      // Update existing settings
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          storeName: data.storeName,
          storeSlogan: data.storeSlogan,
          storeLogo: data.storeLogo,
          storeEmail: data.storeEmail,
          storePhone: data.storePhone,
          storeAddress: data.storeAddress,
          instagramUrl: data.instagramUrl,
          facebookUrl: data.facebookUrl,
          tiktokUrl: data.tiktokUrl,
          whatsappUrl: data.whatsappUrl,
          returnPolicy: data.returnPolicy,
          shippingPolicy: data.shippingPolicy,
          privacyPolicy: data.privacyPolicy,
          termsOfService: data.termsOfService,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          currency: data.currency,
          timeZone: data.timeZone,
          isMaintenanceMode: data.isMaintenanceMode
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Store settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating store settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update store settings' },
      { status: 500 }
    )
  }
}