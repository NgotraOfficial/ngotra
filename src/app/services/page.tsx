import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getServices() {
  const [services, counts, plans] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.groupBy({ by: ['serviceId'], _count: true }),
    prisma.plan.findMany({ select: { serviceSlug: true, level: true }, distinct: ['serviceSlug'] }),
  ])
  const countMap = new Map(counts.map(c => [c.serviceId, c._count]))
  const servicesWithPlans = new Set(plans.map(p => p.serviceSlug))
  return services
    .filter(s => s.featured || servicesWithPlans.has(s.slug) || s.priceStart !== null)
    .map(s => ({ ...s, productCount: countMap.get(s.id) || 0 }))
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="bg-[#09090b]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="section-label mb-4">Services</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">
            What we can do<br />for you.
          </h1>
          <p className="mt-6 text-neutral-500 text-lg max-w-xl leading-relaxed">
            A realistic look at what our team handles — from first conversation to deployed product.
          </p>
        </div>
      </div>

      {/* Service list */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {services.length === 0 ? (
          <div className="card p-8 text-center text-neutral-500 text-sm">No services configured yet.</div>
        ) : (
          <div className="space-y-px">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="block card p-6 md:p-8 group cursor-pointer transition-colors no-underline"
              >
                <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-start">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-white/10 transition-colors">
                    {/* Simple SVG icons based on service type */}
                    {getServiceIcon(service.slug)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h2>
                      {service.featured && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20">Featured</span>
                      )}
                      {service.priceStart && (
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-800 border border-white/5 px-2 py-0.5 rounded">{service.priceStart}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">{service.description}</p>
                    {service.priceStart && (
                      <p className="text-xs font-mono text-neutral-600 mt-2">Starting at {service.priceStart}</p>
                    )}
                  </div>
                  <div className="pt-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-700 group-hover:text-white transition-colors">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="section-label mb-2">Can&apos;t find what you need?</p>
              <p className="text-neutral-400">We also take on custom requests — just tell us what you&apos;re looking for.</p>
            </div>
            <Link href="/contact" className="btn-secondary shrink-0">
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getServiceIcon(slug: string) {
  // Simple colored squares with initials instead of lucide icons
  const colors: Record<string, string> = {
    'web-development': 'bg-blue-500/20 text-blue-400',
    'mobile-app': 'bg-purple-500/20 text-purple-400',
    'desktop-app': 'bg-green-500/20 text-green-400',
    'custom-tools': 'bg-orange-500/20 text-orange-400',
    'minecraft-server': 'bg-emerald-500/20 text-emerald-400',
    'minecraft-mod': 'bg-teal-500/20 text-teal-400',
    'minecraft-plugin': 'bg-cyan-500/20 text-cyan-400',
    'game-hosting': 'bg-red-500/20 text-red-400',
    'web-hosting': 'bg-yellow-500/20 text-yellow-400',
    'vps-hosting': 'bg-pink-500/20 text-pink-400',
  }
  const color = colors[slug] || 'bg-neutral-700/50 text-neutral-400'
  const initials = slug.split('-').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return <span className={`text-sm font-bold ${color}`}>{initials}</span>
}
