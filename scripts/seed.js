const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@ngotra.site' },
    update: {},
    create: { email: 'admin@ngotra.site', username: 'admin', passwordHash: adminPassword, role: 'ADMIN' },
  })
  console.log('Admin user ready')

  // Site settings
  const defaultSettings = [
    { key: 'site_name', value: 'ngotra.studio' },
    { key: 'site_tagline', value: 'Professional Development Studio' },
    { key: 'site_description', value: 'We build software that runs in production.' },
    { key: 'hero_sub', value: 'that runs in production.' },
    { key: 'footer_year', value: '2026' },
    { key: 'accent_color', value: 'blue' },
    { key: 'social_youtube', value: 'https://youtube.com/@ngotra' },
    { key: 'social_x', value: 'https://x.com/ngotra' },
    { key: 'social_instagram', value: 'https://instagram.com/ngotra' },
    { key: 'social_facebook', value: 'https://facebook.com/ngotra' },
    { key: 'social_tiktok', value: 'https://tiktok.com/@ngotra' },
    { key: 'social_discord', value: 'https://discord.gg/ngotra' },
  ]
  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s })
  }
  console.log('Settings updated')

  // Full service taxonomy — expanded categories
  const services = [
    { name: 'Web Development', slug: 'web-development', icon: 'Globe', description: 'Production-ready web apps — SPAs, dashboards, e-commerce, REST & GraphQL APIs.', priceStart: 'From $499', sortOrder: 1 },
    { name: 'Mobile Apps', slug: 'mobile-apps', icon: 'Smartphone', description: 'Cross-platform iOS & Android apps using React Native or Flutter — real UI, not templates.', priceStart: 'From $799', sortOrder: 2 },
    { name: 'Desktop Apps', slug: 'desktop-apps', icon: 'Monitor', description: 'Native and Electron-based desktop applications for Windows, macOS, and Linux.', priceStart: 'From $599', sortOrder: 3 },
    { name: 'Custom Tools', slug: 'custom-tools', icon: 'Wrench', description: 'Automation scripts, internal tooling, CLI utilities, and pipeline builders tailored to your workflow.', priceStart: 'Custom', sortOrder: 4 },
    { name: 'Minecraft Server Setup', slug: 'minecraft-server', icon: 'Server', description: 'Complete server provisioning — survival networks, minigame hubs, proxy infrastructure, and autoscaling on AWS or VPS.', priceStart: 'From $299', sortOrder: 5 },
    { name: 'Minecraft Mods', slug: 'minecraft-mods', icon: 'Shield', description: 'Custom Forge/Fabric mods — new blocks, mobs, mechanics, and full modpack creation with dependency resolution.', priceStart: 'From $199', sortOrder: 6 },
    { name: 'Minecraft Plugins', slug: 'minecraft-plugins', icon: 'Plug', description: 'Bukkit/Spigot/Paper plugins — economies, permissions, custom commands, and Discord integrations.', priceStart: 'From $149', sortOrder: 7 },
    { name: 'Game Hosting', slug: 'game-hosting', icon: 'Cloud', description: 'Dedicated game server hosting with DDoS protection, auto-backups, and a management panel. Minecraft, Terraria, and more.', priceStart: 'From $19/mo', sortOrder: 8 },
    { name: 'Web Hosting', slug: 'web-hosting', icon: 'Globe', description: 'Managed shared and VPS hosting for websites — SSL, staging environments, daily backups, and 99.9% uptime SLA.', priceStart: 'From $9/mo', sortOrder: 9 },
    { name: 'VPS Hosting', slug: 'vps-hosting', icon: 'Server', description: 'Virtual private servers with root access, customizable resource allocations, and full OS control.', priceStart: 'From $29/mo', sortOrder: 10 },
  ]

  const createdServices = []
  for (const svc of services) {
    const created = await prisma.service.upsert({ where: { slug: svc.slug }, update: {}, create: svc })
    createdServices.push(created)
  }
  console.log(`Created ${createdServices.length} services`)

  // Products / downloads per service
  const products = [
    // Web
    { name: 'Landing Page Template', serviceSlug: 'web-development', description: 'Responsive Next.js landing page with Tailwind CSS, dark mode, and contact form integration.', sortOrder: 1 },
    { name: 'Dashboard Starter Kit', serviceSlug: 'web-development', description: 'Admin dashboard boilerplate with charts, tables, auth, and responsive sidebar navigation.', price: '$49', sortOrder: 2 },
    // Mobile
    { name: 'React Native Boilerplate', serviceSlug: 'mobile-apps', description: 'Expo + TypeScript template with navigation, state management, and push notification setup.', sortOrder: 1 },
    // Desktop
    { name: 'Electron Starter', serviceSlug: 'desktop-apps', description: 'Cross-platform Electron app with auto-update, system tray, and native menu support.', sortOrder: 1 },
    // Custom Tools
    { name: 'CLI Project Scaffold', serviceSlug: 'custom-tools', description: 'Generate project structure from a config file — works for any language or framework.', price: 'Free', sortOrder: 1 },
    // MC Servers
    { name: 'Survival Network Config', serviceSlug: 'minecraft-server', description: 'Complete BungeeCord/proxy configuration with land claim, economy, and matchmaking plugins pre-setup.', price: '$99', sortOrder: 1 },
    { name: 'WorldGuard Policies Pack', serviceSlug: 'minecraft-server', description: 'Hardened WorldGuard policy set for survival servers — anti-grief, region claims, spawn protection.', sortOrder: 2 },
    // MC Mods
    { name: 'Biome Expansion Mod Source', serviceSlug: 'minecraft-mods', description: 'Open-source Forge mod adding 20+ biomes with custom structures and mob spawning.', price: 'Free', sortOrder: 1 },
    { name: 'Utility API Library', serviceSlug: 'minecraft-mods', description: 'Shared API library for mod developers — event handling, config managers, and networking helpers.', price: '$29', sortOrder: 2 },
    // MC Plugins
    { name: 'Economy Core Plugin', serviceSlug: 'minecraft-plugins', description: 'Multi-server compatible economy plugin with MySQL backend, vault integration, and transaction logging.', price: '$79', sortOrder: 1 },
    { name: 'Discord Bridge Plugin', serviceSlug: 'minecraft-plugins', description: 'Bidirectional Discord in-game chat bridge with embeds, reactions, and command routing.', price: '$59', sortOrder: 2 },
    // Game Hosting
    { name: 'Auto-Backup Script', serviceSlug: 'game-hosting', description: 'Scheduled world backup script with S3 upload and automatic rotation — ships with every hosting plan.', price: 'Included', sortOrder: 1 },
    // Web Hosting
    { name: 'SSL Certificate Bot', serviceSlug: 'web-hosting', description: 'Automated Lets Encrypt certificate renewal and deployment via cron and acme.sh.', price: 'Included', sortOrder: 1 },
    // VPS
    { name: 'Server Hardening Guide', serviceSlug: 'vps-hosting', description: 'Comprehensive security hardening checklist — firewall, SSH lockdown, fail2ban, and monitoring setup.', price: 'Free', sortOrder: 1 },
  ]

  let productCount = 0
  for (const prod of products) {
    const service = createdServices.find(s => s.slug === prod.serviceSlug)
    if (!service) continue
    await prisma.product.upsert({
      where: { slug: prod.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/\s+/g, '-'),
        serviceId: service.id,
        description: prod.description,
        price: prod.price || null,
        fileUrl: prod.fileUrl || null,
        sortOrder: prod.sortOrder,
      },
    })
    productCount++
  }
  console.log(`Created ${productCount} product downloads`)

  // Sample featured projects
  const sampleProjects = [
    { title: 'CraftHaven Network', slug: 'crafthaven-network', description: '12,000+ member survival server with custom BungeeCord proxy infrastructure, 8 unique minigames, autoscaling on AWS EC2, and a Discord integration for in-game announcements.', tags: 'Minecraft,Java,BungeeCord,AWS', sortOrder: 1, featured: true },
    { title: 'Pixel Realms MMO', slug: 'pixel-realms-mmo', description: 'Voxel-based multiplayer RPG shipped on Steam in early access. Custom Photon networking layer, player-built housing system, and a dynamic economy driven by crafting scarcity.', tags: 'Unity,C#,Photon,Steam SDK', sortOrder: 2, featured: true },
    { title: 'FinTrack Mobile', slug: 'fintrack-mobile', description: 'Budgeting app for iOS and Android with Plaid bank sync, biometric login, and an ML model that automatically categorizes expenses. Currently in private beta with 400 users.', tags: 'Mobile App,Flutter,Firebase', sortOrder: 3, featured: true },
    { title: 'ModHub Launcher', slug: 'modhub-launcher', description: 'Desktop launcher for distributing and managing custom modpacks. Version control via Git, one-click install, automatic dependency resolution. 3,000+ downloads.', tags: 'Desktop App,Electron,Node.js', sortOrder: 4, featured: true },
    { title: 'ContentForge', slug: 'contentforge', description: 'LLM-powered content platform for marketing teams. Template library, collaborative editing, brand voice guardrails, and usage-based billing through Stripe.', tags: 'Web App,Python FastAPI,React', sortOrder: 5, featured: true },
  ]

  for (const proj of sampleProjects) {
    await prisma.project.upsert({ where: { slug: proj.slug }, update: {}, create: proj })
  }
  console.log(`Created ${sampleProjects.length} sample projects`)

  // Sample team members
  const teamMembers = [
    { name: 'Alex Nguyen', slug: 'alex-nguyen', role: 'Founder & Lead Developer', avatar: '', bio: '10+ years building software. Full-stack engineer with a passion for clean architecture and developer experience. Previously led teams at startups and shipped products used by millions.', services: 'Full-stack, Architecture, DevOps', sortOrder: 1, featured: true, socials: JSON.stringify({ github: 'https://github.com/', linkedin: 'https://linkedin.com/', twitter: 'https://twitter.com/' }) },
    { name: 'Sarah Chen', slug: 'sarah-chen', role: 'Senior Minecraft Developer', avatar: '', bio: 'Minecraft modding since 2012. Specialized in Forge/Fabric mod development, server plugins, and large-scale survival networks. Contributed to several popular open-source mods.', services: 'Minecraft Mods, Plugins, Server Setup', sortOrder: 2, featured: false, socials: JSON.stringify({ github: 'https://github.com/', twitter: 'https://twitter.com/' }) },
    { name: 'Marcus Johnson', slug: 'marcus-johnson', role: 'Mobile & Desktop Engineer', avatar: '', bio: 'Cross-platform specialist building React Native and Electron apps. Focus on smooth UX, offline-first architecture, and native integrations that feel right on every platform.', services: 'Mobile Apps, Desktop Apps', sortOrder: 3, featured: false, socials: JSON.stringify({ github: 'https://github.com/', linkedin: 'https://linkedin.com/' }) },
    { name: 'Emma Rodriguez', slug: 'emma-rodriguez', role: 'Backend & Infrastructure', avatar: '', bio: 'Cloud infrastructure and API design expert. AWS certified, Kubernetes enthusiast, and advocate for observability-driven development. Runs production systems at scale.', services: 'Web Development, VPS Hosting, Custom Tools', sortOrder: 4, featured: false, socials: JSON.stringify({ github: 'https://github.com/', linkedin: 'https://linkedin.com/' }) },
  ]

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({ where: { slug: member.slug }, update: {}, create: member })
  }
  console.log(`Created ${teamMembers.length} team members`)

  // Sample pricing plans for major services
  const samplePlans = [
    // Web Development
    { serviceSlug: 'web-development', level: 'REGULAR', title: 'Landing Page', price: '$499', description: 'Perfect for startups and small businesses needing a professional web presence.', features: 'Responsive design\nSEO optimized\nContact form integration\nFast loading speeds\n1 revision round', sortOrder: 1, recommended: false },
    { serviceSlug: 'web-development', level: 'PREMIUM', title: 'Web App', price: '$1,499', description: 'Full-featured web application with authentication, database, and modern UI.', features: 'User authentication\nDatabase integration\nAdmin dashboard\nAPI development\nMobile responsive\n2 revision rounds', sortOrder: 2, recommended: true },
    { serviceSlug: 'web-development', level: 'BIGNESS', title: 'Enterprise', price: '$4,999+', description: 'Scalable enterprise platform with advanced features and priority support.', features: 'Everything in Web App\nMicroservices architecture\nCI/CD pipeline\nPerformance optimization\nPriority support\nUnlimited revisions', sortOrder: 3, recommended: false },
    // Minecraft Server Setup
    { serviceSlug: 'minecraft-server', level: 'REGULAR', title: 'Survival Server', price: '$299', description: 'Complete survival server setup with essential plugins and world configuration.', features: 'BungeeCord/proxy setup\nEssential plugins\nWorld configuration\nBasic customization\nSetup documentation', sortOrder: 1, recommended: false },
    { serviceSlug: 'minecraft-server', level: 'PREMIUM', title: 'Network Server', price: '$799', description: 'Multi-server network with minigames, economy, and custom features.', features: 'Multiple server instances\nCustom minigames\nEconomy system\nDiscord integration\nPerformance tuning\n2 revision rounds', sortOrder: 2, recommended: true },
    { serviceSlug: 'minecraft-server', level: 'BIGNESS', title: 'Full Network', price: '$2,499+', description: 'Large-scale network infrastructure with autoscaling and custom development.', features: 'Everything in Network\nAutoscaling (AWS/GCP)\nCustom plugin development\nDatabase backend\nDDoS protection\nPriority support', sortOrder: 3, recommended: false },
    // VPS Hosting
    { serviceSlug: 'vps-hosting', level: 'REGULAR', title: 'Starter VPS', price: '$29/mo', description: 'Entry-level VPS with root access and essential resources.', features: '2 vCPU cores\n4GB RAM\n50GB SSD storage\nRoot access\nBasic support', sortOrder: 1, recommended: false },
    { serviceSlug: 'vps-hosting', level: 'PREMIUM', title: 'Pro VPS', price: '$79/mo', description: 'Production-ready VPS with enhanced resources and priority support.', features: '4 vCPU cores\n16GB RAM\n100GB NVMe storage\nRoot access\nDaily backups\nPriority support', sortOrder: 2, recommended: true },
    { serviceSlug: 'vps-hosting', level: 'BIGNESS', title: 'Big VPS', price: '$199/mo', description: 'Maximum performance VPS for demanding applications and high traffic.', features: '8 vCPU cores\n32GB RAM\n500GB NVMe storage\nRoot access\nHourly backups\n24/7 priority support\nFree migration', sortOrder: 3, recommended: false },
    // Game Hosting
    { serviceSlug: 'game-hosting', level: 'REGULAR', title: 'Indie Server', price: '$19/mo', description: 'Affordable game hosting for small communities and private servers.', features: 'Up to 20 players\nDDoS protection\nAuto-backups\nMod support\nBasic panel', sortOrder: 1, recommended: false },
    { serviceSlug: 'game-hosting', level: 'PREMIUM', title: 'Community Server', price: '$49/mo', description: 'Dedicated resources for growing communities with custom configurations.', features: 'Up to 100 players\nDedicated resources\nDDoS protection\nAuto-backups\nFull mod support\nAdvanced panel', sortOrder: 2, recommended: true },
    { serviceSlug: 'game-hosting', level: 'BIGNESS', title: 'Pro Network', price: '$149/mo', description: 'Professional-grade hosting for large networks and commercial servers.', features: 'Unlimited players\nMultiple server slots\nPremium hardware\nDDoS protection\nAuto-backups\nWhite-label panel\nPriority support', sortOrder: 3, recommended: false },
  ]

  for (const plan of samplePlans) {
    // Only pass Plan's actual fields to Prisma
    await prisma.plan.create({ data: plan }).catch(async (e) => {
      if (e.meta?.code !== 'P2002') throw e
      // Already exists — find and update
      const existing = await prisma.plan.findFirst({
        where: { serviceSlug: plan.serviceSlug, level: plan.level },
        orderBy: { sortOrder: 'asc' },
      })
      if (existing) {
        await prisma.plan.update({ where: { id: existing.id }, data: plan })
      }
    })
  }
  console.log(`Created ${samplePlans.length} pricing plans`)
  console.log('Seeding completed successfully')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
