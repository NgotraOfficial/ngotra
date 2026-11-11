import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [services, projects, users, settings, tickets, products, teams, plans, textBlocks] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.user.findMany({ select: { id: true, username: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    prisma.siteSetting.findMany(),
    prisma.ticket.findMany({
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.product.findMany({
      include: { service: { select: { name: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.textBlock.findMany({ orderBy: { key: 'asc' } }),
  ])

  return NextResponse.json({ services, projects, users, settings, tickets, products, teams, plans, textBlocks })
}
