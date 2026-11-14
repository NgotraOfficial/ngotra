import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
}

async function getMember(slug: string) {
  return prisma.teamMember.findUnique({ where: { slug } })
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const member = await getMember(slug)
  if (!member) return { title: 'Member Not Found' }
  return {
    title: `${member.name} — ${member.services || 'Team Member'} — NGOTRA`,
    description: member.bio || `Team member profile for ${member.name}`,
  }
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params
  const member = await getMember(slug)

  if (!member) notFound()

  const socials = member.socials ? JSON.parse(member.socials as string) : {}
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="bg-[#09090b]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to team
          </Link>
          <div className="flex items-start gap-6">
            {member.logo ? (
              <img
                src={member.logo}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                <span className="text-2xl font-medium text-neutral-400">{initials}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-semibold text-white">{member.name}</h1>
                  {member.featured && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                      Lead
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {member.services && <span className="text-sm text-neutral-500">{member.services}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
            About
          </h2>
          <p className="text-neutral-300 leading-relaxed">{member.bio}</p>
        </div>
      )}

      {/* Social Links */}
      {(socials.github || socials.linkedin || socials.twitter) && (
        <div className="max-w-4xl mx-auto px-6 py-8 border-t border-white/[0.06]">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
            Connect
          </h2>
          <div className="flex gap-4">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm">LinkedIn</span>
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm">X / Twitter</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Portfolio / Work Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 border-t border-white/[0.06]">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
          Work &amp; Contributions
        </h2>
        <p className="text-neutral-500 text-sm">
          {member.name}&apos;s project portfolio is being added soon. Check back for updates on their latest work.
        </p>
      </div>
    </div>
  )
}
