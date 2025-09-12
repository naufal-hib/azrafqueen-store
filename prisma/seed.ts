// import { PrismaClient, UserRole } from '@prisma/client'
// import bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('🌱 Seeding database...')

//   // 1. Create Admin User dengan hashed password
//   console.log('👤 Creating admin user...')
  
//   const adminEmail = process.env.ADMIN_EMAIL || 'admin@azrafqueen.com'
//   const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
//   // Hash password
//   const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
//   const adminUser = await prisma.user.upsert({
//     where: { email: adminEmail },
//     update: {
//       password: hashedPassword, // Update password jika user sudah ada
//     },
//     create: {
//       name: 'Admin Azrafqueen',
//       email: adminEmail,
//       password: hashedPassword,
//       role: UserRole.ADMIN,
//     },
//   })

//   console.log(`✅ Admin user created: ${adminUser.email}`)

//   // ... rest of existing seed code (categories, products, etc.)
//   // [Keep all existing code for categories and products]

//   console.log('\n🎉 Database seeding completed!')
//   console.log('==========================================')
//   console.log(`👤 Admin Login:`)
//   console.log(`📧 Email: ${adminEmail}`)
//   console.log(`🔒 Password: ${adminPassword}`)
//   console.log('==========================================')
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error('❌ Error seeding database:', e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })


import { PrismaClient, UserRole } from '@prisma/client'

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
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@azrafqueen.com' },
    update: {},
    create: {
      name: 'Admin Azrafqueen',
      email: 'admin@azrafqueen.com',
      password: '$2a$10$example-hashed-password', // In real app, hash this!
      role: UserRole.ADMIN,
    },
  })
  // Suppress unused variable warning for seed file
  void adminUser

  console.log('✅ Admin user created')

  // 3. Create Sample Products
  console.log('📦 Creating sample products...')

  // Abaya Products
  const abaya1 = await prisma.product.create({
    data: {
      name: 'Abaya Dubai Premium Hitam',
      description: 'Abaya premium dengan bahan berkualitas tinggi, cocok untuk acara formal maupun sehari-hari. Desain elegan dengan detail bordir yang indah.',
      price: 350000,
      discountPrice: 299000,
      images: ['/images/products/abaya-1.jpg', '/images/products/abaya-1-detail.jpg'],
      slug: 'abaya-dubai-premium-hitam',
      stock: 50,
      weight: 500,
      isActive: true,
      isFeatured: true,
      categoryId: abayaCategory.id,
      variants: {
        create: [
          { size: 'S', stock: 10, additionalPrice: 0, sku: 'ABY-DUB-HIT-S' },
          { size: 'M', stock: 15, additionalPrice: 0, sku: 'ABY-DUB-HIT-M' },
          { size: 'L', stock: 15, additionalPrice: 0, sku: 'ABY-DUB-HIT-L' },
          { size: 'XL', stock: 10, additionalPrice: 0, sku: 'ABY-DUB-HIT-XL' },
        ],
      },
    },
  })

  const abaya2 = await prisma.product.create({
    data: {
      name: 'Gamis Syari Polos Navy',
      description: 'Gamis syari dengan bahan katun premium, nyaman dipakai sehari-hari. Tersedia dalam warna navy yang elegan.',
      price: 275000,
      images: ['/images/products/gamis-navy.jpg'],
      slug: 'gamis-syari-polos-navy',
      stock: 30,
      weight: 400,
      isActive: true,
      isFeatured: false,
      categoryId: abayaCategory.id,
      variants: {
        create: [
          { size: 'S', stock: 8, additionalPrice: 0, sku: 'GAM-SYR-NAV-S' },
          { size: 'M', stock: 10, additionalPrice: 0, sku: 'GAM-SYR-NAV-M' },
          { size: 'L', stock: 12, additionalPrice: 0, sku: 'GAM-SYR-NAV-L' },
        ],
      },
    },
  })
  // Suppress unused variable warning for seed file
  void abaya2

  // Hijab Products
  const hijab1 = await prisma.product.create({
    data: {
      name: 'Hijab Segiempat Voal Premium',
      description: 'Hijab segiempat dengan bahan voal premium yang ringan dan adem. Tersedia dalam berbagai warna cantik.',
      price: 65000,
      discountPrice: 55000,
      images: ['/images/products/hijab-voal.jpg'],
      slug: 'hijab-segiempat-voal-premium',
      stock: 100,
      weight: 50,
      isActive: true,
      isFeatured: true,
      categoryId: hijabCategory.id,
      variants: {
        create: [
          { color: 'Hitam', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-HIT' },
          { color: 'Navy', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-NAV' },
          { color: 'Maroon', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-MAR' },
          { color: 'Abu-abu', stock: 25, additionalPrice: 0, sku: 'HIJ-VOA-ABU' },
        ],
      },
    },
  })

  // Pashmina Product
  const pashmina1 = await prisma.product.create({
    data: {
      name: 'Pashmina Crinkle Gradasi',
      description: 'Pashmina dengan tekstur crinkle dan gradasi warna yang indah. Cocok untuk berbagai occasion.',
      price: 89000,
      images: ['/images/products/pashmina-crinkle.jpg'],
      slug: 'pashmina-crinkle-gradasi',
      stock: 75,
      weight: 80,
      isActive: true,
      isFeatured: false,
      categoryId: pashinaCategory.id,
      variants: {
        create: [
          { color: 'Pink Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-PIN' },
          { color: 'Blue Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-BLU' },
          { color: 'Purple Gradasi', stock: 25, additionalPrice: 0, sku: 'PAS-CRI-PUR' },
        ],
      },
    },
  })
  // Suppress unused variable warning for seed file
  void pashmina1

  // Buku Products
  const quran1 = await prisma.product.create({
    data: {
      name: 'Al-Qur\'an Tajwid & Terjemahan',
      description: 'Al-Qur\'an dengan panduan tajwid lengkap dan terjemahan Bahasa Indonesia. Kertas berkualitas tinggi.',
      price: 125000,
      images: ['/images/products/quran-tajwid.jpg'],
      slug: 'al-quran-tajwid-terjemahan',
      stock: 40,
      weight: 800,
      isActive: true,
      isFeatured: true,
      categoryId: bukuCategory.id,
    },
  })
  // Suppress unused variable warning for seed file
  void quran1

  const bukuDoa = await prisma.product.create({
    data: {
      name: 'Buku Doa Sehari-hari',
      description: 'Kumpulan doa-doa pilihan untuk kehidupan sehari-hari, lengkap dengan terjemahan dan manfaatnya.',
      price: 45000,
      images: ['/images/products/buku-doa.jpg'],
      slug: 'buku-doa-sehari-hari',
      stock: 60,
      weight: 200,
      isActive: true,
      isFeatured: false,
      categoryId: bukuCategory.id,
    },
  })
  // Suppress unused variable warning for seed file
  void bukuDoa

  // Baju Anak
  const bajuAnak1 = await prisma.product.create({
    data: {
      name: 'Baju Koko Anak Premium',
      description: 'Baju koko untuk anak dengan bahan katun premium, nyaman dan cocok untuk acara formal.',
      price: 89000,
      images: ['/images/products/koko-anak.jpg'],
      slug: 'baju-koko-anak-premium',
      stock: 45,
      weight: 150,
      isActive: true,
      isFeatured: false,
      categoryId: anakCategory.id,
      variants: {
        create: [
          { size: '1-2 Tahun', stock: 10, additionalPrice: 0, sku: 'KOK-ANK-1-2' },
          { size: '3-4 Tahun', stock: 15, additionalPrice: 0, sku: 'KOK-ANK-3-4' },
          { size: '5-6 Tahun', stock: 15, additionalPrice: 0, sku: 'KOK-ANK-5-6' },
          { size: '7-8 Tahun', stock: 5, additionalPrice: 0, sku: 'KOK-ANK-7-8' },
        ],
      },
    },
  })
  // Suppress unused variable warning for seed file
  void bajuAnak1

  console.log('✅ Sample products created')

  // 4. Create Sample Order (for testing)
  console.log('🛍️ Creating sample order...')
  
  const sampleOrder = await prisma.order.create({
    data: {
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
  // Suppress unused variable warning for seed file
  void sampleOrder

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
  console.log('🔒 Password: (will setup in authentication)')
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