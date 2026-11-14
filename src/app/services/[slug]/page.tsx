import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Check, Download } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

async function getServiceData(slug: string) {
  const service = await prisma.service.findUnique({ where: { slug } })
  if (!service) return { service: null, products: [], plans: [] }
  const [products, plans] = await Promise.all([
    prisma.product.findMany({ where: { serviceId: service.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.plan.findMany({ where: { serviceSlug: slug }, orderBy: { sortOrder: 'asc' } }),
  ])
  return { service, products, plans }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const service = await prisma.service.findUnique({ where: { slug } })
  if (!service) return { title: 'Service Not Found' }
  return { title: `${service.name} — NGOTRA`, description: service.description }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const { service, products, plans } = await getServiceData(slug)

  if (!service) notFound()

  return (
    <div className="bg-[#09090b]">
      {/* Hero */}
      <div className="border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <Link href="/services" className="text-sm text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1 mb-6">
            ← Back to services
          </Link>
          <p className="section-label mb-3">{service.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">{service.name}</h1>
          <p className="mt-6 text-neutral-500 text-lg max-w-xl leading-relaxed">{service.description}</p>
          {service.priceStart && (
            <p className="mt-4 text-sm font-mono text-neutral-400">Starting at {service.priceStart}</p>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      {plans.length > 0 && (
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-medium text-white">Pricing</h2>
              <p className="text-sm text-neutral-500 mt-1">Choose a plan that fits your needs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-medium text-white">Ready to get started?</p>
            <p className="text-sm text-neutral-500 mt-1">Tell us about your project and we&apos;ll respond within a day.</p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Start a project
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: { id: string; name: string; description: string; price?: string | null; fileUrl?: string | null; featured: boolean } }) {
  return (
    <div className="card p-5 md:p-6 group">
      <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">{product.name}</h3>
            {product.featured && (
              <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20">Featured</span>
            )}
            {product.price && (
              <span className="text-xs font-mono text-neutral-500 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded">{product.price}</span>
            )}
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>
        </div>
        {product.fileUrl && (
          <a href={product.fileUrl} download target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md text-sm transition-colors shrink-0">
            <Download size={14} />
            Download
          </a>
        )}
      </div>
    </div>
  )
}

function PlanCard({ plan }: { plan: { id: string; level: string; title: string; price: string; description: string; features: string; recommended: boolean; sortOrder: number } }) {
  const levelColors: Record<string, string> = {
    REGULAR: 'border-neutral-700',
    PREMIUM: 'border-blue-500',
    BIGNESS: 'border-yellow-500',
  }
  const levelLabels: Record<string, string> = {
    REGULAR: 'Regular',
    PREMIUM: 'Premium',
    BIGNESS: 'Bigness',
  }
  const featureList = plan.features.split('\n').filter(Boolean)

  return (
    <div className={`card p-6 ${plan.recommended ? 'border-blue-500/50 ring-1 ring-blue-500/30' : levelColors[plan.level] || 'border-white/5'} relative`}>
      {plan.recommended && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}
      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{levelLabels[plan.level]}</p>
        {plan.sortOrder === 1 && <span className="text-xs text-blue-400">• Most Popular</span>}
      </div>
      <h3 className="text-xl font-semibold text-white mt-2">{plan.title}</h3>
      <p className="text-2xl font-semibold text-white mt-3">{plan.price}<span className="text-sm font-normal text-neutral-500 ml-1">/project</span></p>
      <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{plan.description}</p>
      <ul className="mt-5 space-y-2">
        {featureList.map((feat, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
            <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
            <span>{feat.trim()}</span>
          </li>
        ))}
      </ul>
      <Link href="/contact" className="mt-6 block w-full text-center px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-md hover:bg-white/10 transition-colors">
        Get started
      </Link>
    </div>
  )
}
