import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET /api/tickets/[id]/messages - Get all messages for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, email: true } }
    }
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Check permission
  if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, username: true, role: true } }
    }
  })

  return NextResponse.json({ messages, ticket })
}

// POST /api/tickets/[id]/messages - Add a message to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: true }
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Check permission
  if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body

  if (!content || content.trim() === '') {
    return NextResponse.json(
      { error: 'Message content is required' },
      { status: 400 }
    )
  }

  const isAdmin = session.user.role === 'ADMIN'

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      senderId: session.user.id,
      content: content.trim(),
      role: isAdmin ? 'ADMIN' : 'CUSTOMER'
    },
    include: {
      sender: { select: { id: true, username: true, role: true } }
    }
  })

  // Update ticket status if admin replies
  if (isAdmin && ticket.status === 'OPEN') {
    await prisma.ticket.update({
      where: { id },
      data: { status: 'IN_PROGRESS' }
    })
  }

  // Update ticket updated timestamp
  await prisma.ticket.update({
    where: { id },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json({ message }, { status: 201 })
}