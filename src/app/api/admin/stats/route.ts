import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    const settingsMap = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]))
    const textBlocksList = textBlocks.map((tb: { key: string; content: string }) => ({ key: tb.key, content: tb.content }))

    return NextResponse.json({ services, projects, users, settings: settingsMap, tickets, products, teams, plans, textBlocks: textBlocksList })
  } catch (error) {
    console.error('Stats load error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
