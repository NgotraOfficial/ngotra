import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getTeam() {
  return prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } })
}

export default async function TeamPage() {
  const members = await getTeam()

  return (
    <div className="min-h-screen">
      {/* Header with content */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <p className="section-label mb-4">Our team</p>
          <h1 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05] max-w-3xl">
            The people behind<br /><span className="text-neutral-500">the code.</span>
          </h1>
          <p className="mt-7 text-neutral-500 text-base md:text-lg max-w-xl leading-relaxed">
            Six engineers across two timezones. We've shipped 50+ projects together —
            and we're just getting started.
          </p>
        </div>
      </section>

      {/* Members grid */}
      <section className="bg-[#0c0c0f]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          {members.length === 0 ? (
            <div className="card p-8 text-center text-neutral-500 text-sm">No team members added yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Link href={`/team/${member.slug}`} key={member.id} className="block no-underline">
                  <TeamCard member={member} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function TeamCard({ member }: { member: { id: number; name: string; logo: string | null; bio: string | null; socials: any; services: string | null; featured: boolean; sortOrder: number; slug: string } }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="card p-6 group hover:border-white/15 transition-colors">
      <div className="flex items-start gap-4">
        {member.logo ? (
          <img src={member.logo} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-neutral-400">{initials}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">{member.name}</h3>
            {member.featured && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 shrink-0">Lead</span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">{member.services || 'Team Member'}</p>
          {member.bio && (
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed line-clamp-3">{member.bio}</p>
          )}
        </div>
      </div>
    </div>
  )
}
