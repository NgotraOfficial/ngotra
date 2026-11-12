import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET /api/tickets - List all tickets (admin) or user's tickets
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.role === 'ADMIN'
  const where = isAdmin ? {} : { userId: session.user.id }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true, role: true } }
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 50
  })

  return NextResponse.json({ tickets })
}

// POST /api/tickets - Create a new ticket with initial message
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, category, priority } = body

  if (!title || !description) {
    return NextResponse.json(
      { error: 'Title and description are required' },
      { status: 400 }
    )
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description: null,
      category: category || 'General',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      userId: session.user.id,
      messages: {
        create: {
          userId: session.user.id,
          senderId: session.user.id,
          content: description,
          role: 'CUSTOMER'
        }
      }
    },
    include: {
      user: { select: { id: true, username: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, username: true, role: true } }
        }
      }
    }
  })

  return NextResponse.json({ ticket }, { status: 201 })
}