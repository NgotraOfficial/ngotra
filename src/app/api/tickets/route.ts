import { NextResponse } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get('admin') === 'true' && session.user.role === 'ADMIN'

  const where = showAll ? {} : { userId: session.user.id }
  const tickets = await prisma.ticket.findMany({
    where,
    include: { user: { select: { username: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  return NextResponse.json(tickets)
}

export async function POST(req: Request) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ticket = await prisma.ticket.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category || 'General',
      priority: body.priority || 'MEDIUM',
      userId: session.user.id,
      userAgent: navigator?.userAgent,
    }
  })
  revalidatePath('/dashboard')
  return NextResponse.json(ticket, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...data } = body

  // Users can only update their own tickets unless they're admin
  if (session.user.role !== 'ADMIN') {
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket || ticket.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const ticket = await prisma.ticket.update({ where: { id }, data })
  revalidatePath('/dashboard')
  return NextResponse.json(ticket)
}
