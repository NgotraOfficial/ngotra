import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ngotra-secret-key-change-in-production-2024'
)

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('session='))?.split('=')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user
  try {
    const { payload } = await jwtVerify(token, SECRET)
    user = { id: payload.id as string, username: payload.username as string, email: payload.email as string, role: payload.role as string }
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
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
