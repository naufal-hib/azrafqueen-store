-- CreateTable
CREATE TABLE "public"."store_settings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Azraf Queen Store',
    "storeSlogan" TEXT DEFAULT 'Premium Islamic Fashion & Lifestyle',
    "storeLogo" TEXT,
    "storeEmail" TEXT DEFAULT 'info@azrafqueen.com',
    "storePhone" TEXT DEFAULT '+62 812-3456-7890',
    "storeAddress" TEXT DEFAULT 'Jakarta, Indonesia',
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "whatsappUrl" TEXT,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "privacyPolicy" TEXT,
    "termsOfService" TEXT,
    "metaTitle" TEXT DEFAULT 'Azraf Queen Store - Premium Islamic Fashion',
    "metaDescription" TEXT DEFAULT 'Toko online terpercaya untuk fashion muslimah berkualitas premium',
    "metaKeywords" TEXT DEFAULT 'fashion muslimah, abaya, hijab, gamis, busana muslim',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
