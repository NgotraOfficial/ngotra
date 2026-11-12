import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

const CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'Game Dev',
  'Minecraft Servers',
  'Mods & Plugins',
  'DevOps & Cloud',
]

async function getSiteData() {
  const [settings, projects] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.project.findMany({
      where: { featured: true },
      orderBy: { sortOrder: 'asc' },
      take: 4,
    }),
  ])
  return {
    settings: Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value])),
    projects: projects.map((p: { id: string; title: string; description: string; tags?: string; createdAt: Date; link?: string; slug: string }) => ({
      id: p.id,
      title: p.title,
      category: 'Project',
      description: p.description,
      tags: p.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
      year: new Date(p.createdAt).getFullYear().toString(),
      link: p.link || `/projects/${p.slug}`,
    })),
  }
}

export default async function Home() {
  const { settings, projects } = await getSiteData()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 pt-32 md:pt-40 pb-28 md:pb-36">
          <p className="section-label mb-5 text-xs md:text-sm">{settings['site_name'] ? `${settings['site_name']} Studio` : 'Studio'}</p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
            We build software<br />
            <span className="text-neutral-500 text-sm md:text-base">{settings['hero_sub'] || 'that scales when it matters.'}</span>
          </h1>
          <p className="mt-5 text-sm md:text-base lg:text-lg text-neutral-500 max-w-xl leading-relaxed">
            {settings['site_description'] || 'A small team of engineers crafting web apps, games, mobile products, and Minecraft ecosystems — everything from first commit to live deployment.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/contact" className="btn-primary text-sm py-2 px-5">
              Start a project
              <ArrowUpRight size={13} />
            </Link>
            <Link href="/projects" className="btn-secondary text-sm py-2 px-5">
              View work
            </Link>
          </div>
        </div>
      </section>

      {/* Services strip */}
      <section className="bg-[#0c0c0f] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-8">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {CATEGORIES.map((s) => (
              <span key={s} className="text-sm text-neutral-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 inline-block" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-3">Selected work</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Recent projects</h2>
            </div>
            <Link href="/projects" className="text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
              All projects <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-px">
            {projects.length > 0 ? projects.map((project: any, i: number) => (
              <ProjectRow key={project.id} project={project} />
            )) : (
              <div className="card p-8 text-center text-neutral-500 text-sm">No featured projects yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0c0c0f] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              ['50+', 'Projects shipped'],
              ['2yr+', 'Avg client engagement'],
              ['12k+', 'Active MC players served'],
              ['24h', 'Average response time'],
            ].map(([value, label], i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-semibold text-white tracking-tight">{value}</p>
                <p className="text-sm text-neutral-600 mt-2 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#09090b]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <div className="max-w-xl">
            <p className="section-label mb-4">Next project</p>
            <h2 className="text-2xl md:text-4xl font-semibold text-white leading-tight mb-6">
              Have something you want<br />to build?
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-8">
              Tell us what you need — we respond within a day with a rough scope and timeline.
              No pitch decks required.
            </p>
            <Link href="/contact" className="btn-primary">
              Get in touch
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectRow({ project }: { project: { id: string; title: string; category: string; description: string; tags: string[]; year: string; link?: string } }) {
  return (
    <a href={project.link || '#'} className="block card p-5 md:p-7 group cursor-pointer transition-colors no-underline">
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_200px_auto] gap-4 items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xs font-mono text-neutral-600">{project.category}</p>
            <span className="text-neutral-800">·</span>
            <p className="text-xs font-mono text-neutral-700">{project.year}</p>
          </div>
          <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed max-w-lg">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-neutral-600 bg-neutral-900 border border-white/5 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs text-neutral-700 font-mono">Case study available</p>
        </div>
        <div className="flex items-start pt-1">
          <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
        </div>
      </div>
    </a>
  )
}
