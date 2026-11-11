'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface Project {
  id: string
  title: string
  slug: string
  category: string
  tag: string
  description: string
  tags: string[]
  image?: string | null
  link?: string | null
}

interface Props {
  projects: Project[]
  categories: string[]
}

export default function ProjectFilter({ projects, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.tags.includes(selectedCategory) || p.category === selectedCategory)

  return (
    <div>
      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Projects list */}
      {filteredProjects.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500 text-sm">
          No projects found in this category.
        </div>
      ) : (
        <div className="space-y-px">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="block card p-6 group cursor-pointer transition-colors no-underline"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {project.tag && (
                      <span className="text-xs font-mono text-neutral-600">{project.tag}</span>
                    )}
                    <span className="text-neutral-800">&middot;</span>
                    <span className="text-xs text-neutral-700">{project.category}</span>
                  </div>
                  <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-2 leading-relaxed max-w-xl">
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-neutral-600 bg-neutral-900 border border-white/5 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <p className="text-xs text-blue-400/60 mt-2 inline-flex items-center gap-1">
                      View project <ArrowUpRight size={12} />
                    </p>
                  )}
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-neutral-700 group-hover:text-white transition-colors mt-1 flex-shrink-0"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
