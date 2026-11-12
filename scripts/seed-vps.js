const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@ngotra.site' },
    update: {},
    create: {
      email: 'admin@ngotra.site',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin created')

  // Site settings
  const settings = [
    { key: 'site_name', value: 'Ngotra' },
    { key: 'site_tagline', value: 'Engineering bespoke digital experiences with precision and scale.' },
    { key: 'site_description', value: 'A small team of engineers crafting web apps, games, mobile products, and Minecraft ecosystems.' },
    { key: 'hero_sub', value: 'that scales when it matters.' },
    { key: 'footer_year', value: '2026' },
    { key: 'accent_color', value: 'blue' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('Site settings seeded')
}

main()
  .then(() => { console.log('Done'); process.exit(0) })
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
