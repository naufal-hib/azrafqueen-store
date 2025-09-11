import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper function untuk handle database errors
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL database')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    return false
  }
}

// Helper function untuk disconnect
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
    return true
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
    return false
  }
}