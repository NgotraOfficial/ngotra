import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProjectFilter from './ProjectFilter'

async function getProjects() {
  return prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })
}

export default async function ProjectsPage() {
  const raw = await getProjects()
  const projects = raw.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.tags?.split(',')[0]?.trim() || 'Project',
    tag: (p.tags || '').split(',').map(t => t.trim()).filter(Boolean)[1] || '',
    description: p.description,
    tags: (p.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    image: p.image,
    link: p.link,
  }))

  const allTags = new Set<string>()
  projects.forEach(p => {
    p.tags.forEach(t => allTags.add(t))
  })

  const categories = ['All', ...Array.from(allTags)]

  return (
    <div className="min-h-screen">
      {/* Header with content */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <p className="section-label mb-4">Our work</p>
          <h1 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05] max-w-3xl">
            Projects we've<br /><span className="text-neutral-500">shipped with pride.</span>
          </h1>
          <p className="mt-7 text-neutral-500 text-base md:text-lg max-w-xl leading-relaxed">
            From web apps to Minecraft servers, these are the products
            our clients trust us to build and maintain.
          </p>
        </div>
      </section>

      {/* Projects list */}
      <section className="bg-[#0c0c0f]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          <ProjectFilter projects={projects} categories={categories} />

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-sm text-neutral-600">
              Want case studies with architecture details and lessons learned?{' '}
              <Link href="/contact" className="text-blue-400 hover:underline">
                Reach out directly
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
