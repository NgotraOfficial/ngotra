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

  // Collect unique category tags across all projects
  const allTags = new Set<string>()
  projects.forEach(p => {
    p.tags.forEach(t => allTags.add(t))
  })

  const categories = ['All', ...Array.from(allTags)]

  return (
    <div className="bg-[#09090b]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
    </div>
  )
}
