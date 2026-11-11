import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ngotra.site' },
    update: {},
    create: {
      email: 'admin@ngotra.site',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', admin.email)

  // Create sample services
  const services = [
    { name: 'Web Development', slug: 'web-development', icon: 'Code', description: 'Modern, responsive websites and web applications', sortOrder: 1 },
    { name: 'App Development', slug: 'app-development', icon: 'Smartphone', description: 'Native and cross-platform mobile applications', sortOrder: 2 },
    { name: 'Game Development', slug: 'game-development', icon: 'Gamepad2', description: 'Engaging games for all platforms and genres', sortOrder: 3 },
    { name: 'Minecraft Servers', slug: 'minecraft-servers', icon: 'Server', description: 'Custom server setups and maintenance', sortOrder: 4 },
    { name: 'Mods & Plugins', slug: 'mods-plugins', icon: 'Shield', description: 'Custom modifications and plugin development', sortOrder: 5 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }

  console.log('Sample services created')
}

main()
  .then(() => console.log('Seeding completed'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
