import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Tags } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string) {
  return prisma.project.findUnique({ where: { slug } })
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project Not Found' }
  return { title: `${project.title} — NGOTRA`, description: project.description }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) notFound()

  const tags = (project.tags || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="bg-[#09090b]">
      {/* Hero */}
      <div className="border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <Link href="/projects" className="text-sm text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1 mb-6">
            <ArrowLeft size={14} /> Back to projects
          </Link>

          {project.image && (
            <div className="mb-8 rounded-lg overflow-hidden border border-white/10">
              <img src={project.image} alt={project.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs font-mono text-neutral-500 bg-neutral-900 border border-white/5 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className="text-neutral-800">&middot;</span>
            <span className="text-xs text-neutral-600 flex items-center gap-1">
              <Calendar size={12} />
              {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">{project.title}</h1>
          <p className="mt-6 text-neutral-500 text-lg max-w-xl leading-relaxed">{project.description}</p>

          {project.link && (
            <div className="mt-8">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-md text-sm transition-colors"
              >
                View Live Project
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-white mb-4">About this project</h2>
              <p className="text-neutral-400 leading-relaxed">
                {project.description}
              </p>
            </div>

            {tags.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Tags size={16} /> Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-sm text-neutral-400 bg-neutral-900 border border-white/5 px-3 py-1.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-sm font-medium text-white mb-4">Project Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Status</dt>
                  <dd className="text-white font-medium">Shipped</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Published</dt>
                  <dd className="text-neutral-400">{new Date(project.createdAt).toLocaleDateString()}</dd>
                </div>
                {project.link && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Live URL</dt>
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                      Visit <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </dl>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-medium text-white mb-3">More work</h3>
              <Link href="/projects" className="text-sm text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1">
                View all projects <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
