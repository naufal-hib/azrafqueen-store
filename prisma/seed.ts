import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Categories
  console.log('📁 Creating categories...')
  
  const abayaCategory = await prisma.category.upsert({
    where: { slug: 'abaya' },
    update: {},
    create: {
      name: 'Abaya',
      slug: 'abaya',
      description: 'Koleksi abaya dan gamis syari berkualitas premium',
      isActive: true,
    },
  })

  const hijabCategory = await prisma.category.upsert({
    where: { slug: 'hijab' },
    update: {},
    create: {
      name: 'Hijab & Kerudung',
      slug: 'hijab',
      description: 'Berbagai model hijab dan kerudung modern',
      isActive: true,
    },
  })

  const pashinaCategory = await prisma.category.upsert({
    where: { slug: 'pashmina' },
    update: {},
    create: {
      name: 'Pashmina',
      slug: 'pashmina',
      description: 'Pashmina halus dan berkualitas tinggi',
      isActive: true,
    },
  })

  const bukuCategory = await prisma.category.upsert({
    where: { slug: 'buku-islam' },
    update: {},
    create: {
      name: 'Buku & Al-Qur\'an',
      slug: 'buku-islam',
      description: 'Al-Qur\'an, buku doa, dan literatur Islami',
      isActive: true,
    },
  })

  const anakCategory = await prisma.category.upsert({
    where: { slug: 'baju-anak' },
    update: {},
    create: {
      name: 'Baju Muslim Anak',
      slug: 'baju-anak',
      description: 'Pakaian muslim untuk anak-anak',
      isActive: true,
    },
  })

  console.log('✅ Categories created')

  // 2. Create Admin User
  console.log('👤 Creating admin user...')
  
  const adminEmail = 'admin@azrafqueen.com'
  const adminPassword = 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      name: 'Admin Azrafqueen',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log('✅ Admin user created/updated')

  // 3. Create Sample Products (Simple version)
  console.log('📦 Creating sample products...')

  // Abaya Products
  const abaya1 = await prisma.product.upsert({
    where: { slug: 'abaya-dubai-premium-hitam' },
    update: {},
    create: {
      name: 'Abaya Dubai Premium Hitam',
      description: 'Abaya premium dengan bahan berkualitas tinggi, cocok untuk acara formal maupun sehari-hari. Desain elegan dengan detail bordir yang indah.',
      price: 350000,
      discountPrice: 299000,
      images: ['/images/placeholder-product.svg'],
      slug: 'abaya-dubai-premium-hitam',
      stock: 50,
      weight: 500,
      isActive: true,
      isFeatured: true,
      categoryId: abayaCategory.id,
      variants: {
        create: [
          { size: 'S', stock: 10, additionalPrice: 0, sku: 'ABY-DUB-HIT-S', isActive: true },
          { size: 'M', stock: 15, additionalPrice: 0, sku: 'ABY-DUB-HIT-M', isActive: true },
          { size: 'L', stock: 15, additionalPrice: 0, sku: 'ABY-DUB-HIT-L', isActive: true },
          { size: 'XL', stock: 10, additionalPrice: 0, sku: 'ABY-DUB-HIT-XL', isActive: true },
        ],
      },
    },
  })

  const abaya2 = await prisma.product.upsert({
    where: { slug: 'gamis-syari-polos-navy' },
    update: {},
    create: {
      name: 'Gamis Syari Polos Navy',
      description: 'Gamis syari dengan bahan katun premium, nyaman dipakai sehari-hari. Tersedia dalam warna navy yang elegan.',
      price: 275000,
      images: ['/images/placeholder-product.svg'],
      slug: 'gamis-syari-polos-navy',
      stock: 30,
      weight: 400,
      isActive: true,
      isFeatured: false,
      categoryId: abayaCategory.id,
      variants: {
        create: [
          { size: 'S', stock: 8, additionalPrice: 0, sku: 'GAM-SYR-NAV-S', isActive: true },
          { size: 'M', stock: 10, additionalPrice: 0, sku: 'GAM-SYR-NAV-M', isActive: true },
          { size: 'L', stock: 12, additionalPrice: 0, sku: 'GAM-SYR-NAV-L', isActive: true },
        ],
      },
    },
  })

  // Hijab Products
  const hijab1 = await prisma.product.upsert({
    where: { slug: 'hijab-segiempat-voal-premium' },
    update: {},
    create: {
      name: 'Hijab Segiempat Voal Premium',
      description: 'Hijab segiempat dengan bahan voal premium yang ringan dan adem. Tersedia dalam berbagai warna cantik.',
      price: 65000,
      discountPrice: 55000,
      images: ['/images/placeholder-product.svg'],
      slug: 'hijab-segiempat-voal-premium',
      stock: 100,
      weight: 50,
      isActive: true,
      isFeatured: true,
      categoryId: hijabCategory.id,
      variants: {
        create: [
          { color: 'Hitam', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-HIT', isActive: true },
          { color: 'Navy', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-NAV', isActive: true },
          { color: 'Maroon', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-MAR', isActive: true },
          { color: 'Abu-abu', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-ABU', isActive: true },
        ],
      },
    },
  })

  // Pashmina Product
  const pashmina1 = await prisma.product.upsert({
    where: { slug: 'pashmina-crinkle-gradasi' },
    update: {},
    create: {
      name: 'Pashmina Crinkle Gradasi',
      description: 'Pashmina dengan tekstur crinkle dan gradasi warna yang indah. Cocok untuk berbagai occasion.',
      price: 89000,
      images: ['/images/placeholder-product.svg'],
      slug: 'pashmina-crinkle-gradasi',
      stock: 75,
      weight: 80,
      isActive: true,
      isFeatured: false,
      categoryId: pashinaCategory.id,
      variants: {
        create: [
          { color: 'Pink Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-PIN', isActive: true },
          { color: 'Blue Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-BLU', isActive: true },
          { color: 'Purple Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-PUR', isActive: true },
        ],
      },
    },
  })

  // Buku Products
  const quran1 = await prisma.product.upsert({
    where: { slug: 'al-quran-tajwid-terjemahan' },
    update: {},
    create: {
      name: 'Al-Qur\'an Tajwid & Terjemahan',
      description: 'Al-Qur\'an dengan panduan tajwid lengkap dan terjemahan Bahasa Indonesia. Kertas berkualitas tinggi.',
      price: 125000,
      images: ['/images/placeholder-product.svg'],
      slug: 'al-quran-tajwid-terjemahan',
      stock: 40,
      weight: 800,
      isActive: true,
      isFeatured: true,
      categoryId: bukuCategory.id,
    },
  })

  const bukuDoa = await prisma.product.upsert({
    where: { slug: 'buku-doa-sehari-hari' },
    update: {},
    create: {
      name: 'Buku Doa Sehari-hari',
      description: 'Kumpulan doa-doa pilihan untuk kehidupan sehari-hari, lengkap dengan terjemahan dan manfaatnya.',
      price: 45000,
      images: ['/images/placeholder-product.svg'],
      slug: 'buku-doa-sehari-hari',
      stock: 60,
      weight: 200,
      isActive: true,
      isFeatured: false,
      categoryId: bukuCategory.id,
    },
  })

  // Baju Anak
  const bajuAnak1 = await prisma.product.upsert({
    where: { slug: 'baju-koko-anak-premium' },
    update: {},
    create: {
      name: 'Baju Koko Anak Premium',
      description: 'Baju koko untuk anak dengan bahan katun premium, nyaman dan cocok untuk acara formal.',
      price: 89000,
      images: ['/images/placeholder-product.svg'],
      slug: 'baju-koko-anak-premium',
      stock: 45,
      weight: 150,
      isActive: true,
      isFeatured: false,
      categoryId: anakCategory.id,
      variants: {
        create: [
          { size: '1-2 Tahun', stock: 10, additionalPrice: 0, sku: 'KOK-ANK-1-2', isActive: true },
          { size: '3-4 Tahun', stock: 15, additionalPrice: 0, sku: 'KOK-ANK-3-4', isActive: true },
          { size: '5-6 Tahun', stock: 15, additionalPrice: 0, sku: 'KOK-ANK-5-6', isActive: true },
          { size: '7-8 Tahun', stock: 5, additionalPrice: 0, sku: 'KOK-ANK-7-8', isActive: true },
        ],
      },
    },
  })

  console.log('✅ Sample products created')

  // 4. Create Sample Order (for testing)
  console.log('🛍️ Creating sample order...')
  
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'ORD-2024-001' },
    update: {},
    create: {
      orderNumber: 'ORD-2024-001',
      customerName: 'Siti Aisyah',
      customerEmail: 'siti.aisyah@email.com',
      customerPhone: '081234567890',
      shippingAddress: {
        name: 'Siti Aisyah',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
        notes: 'Rumah cat biru, sebelah warung Bu Ani'
      },
      subtotal: 354000,
      shippingCost: 15000,
      totalAmount: 369000,
      paymentMethod: 'Bank Transfer',
      notes: 'Mohon kirim secepatnya',
      items: {
        create: [
          {
            productName: 'Abaya Dubai Premium Hitam',
            variantInfo: 'Size: M',
            quantity: 1,
            price: 299000,
            subtotal: 299000,
            productId: abaya1.id,
          },
          {
            productName: 'Hijab Segiempat Voal Premium',
            variantInfo: 'Color: Hitam',
            quantity: 1,
            price: 55000,
            subtotal: 55000,
            productId: hijab1.id,
          },
        ],
      },
    },
  })

  console.log('✅ Sample order created')

  // 5. Display Summary
  console.log('\n📊 Database seeding completed!')
  console.log('==========================================')
  console.log(`📁 Categories: ${await prisma.category.count()}`)
  console.log(`📦 Products: ${await prisma.product.count()}`)
  console.log(`🔧 Product Variants: ${await prisma.productVariant.count()}`)
  console.log(`👤 Users: ${await prisma.user.count()}`)
  console.log(`🛍️ Orders: ${await prisma.order.count()}`)
  console.log(`📋 Order Items: ${await prisma.orderItem.count()}`)
  console.log('==========================================')
  
  console.log('\n🎉 Database is ready for development!')
  console.log('📧 Admin login: admin@azrafqueen.com')
  console.log('🔒 Password: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })