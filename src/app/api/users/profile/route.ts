import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Prevent changing role
  if (body.role) delete body.role

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: body
  })

  return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } })
}
