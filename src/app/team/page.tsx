import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getTeam() {
  return prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } })
}

export default async function TeamPage() {
  const members = await getTeam()

  return (
    <div className="bg-[#09090b]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8">
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
