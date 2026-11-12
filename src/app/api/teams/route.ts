import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const teams = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(teams)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // Remove empty id for new records — TeamMember uses auto-increment Int PK
  const { id, ...data } = body
  const member = await prisma.teamMember.create({ data })
  return NextResponse.json(member, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...data } = body
  if (!id || isNaN(Number(id))) return NextResponse.json({ error: 'Missing valid id' }, { status: 400 })
  const member = await prisma.teamMember.update({ where: { id: Number(id) }, data })
  return NextResponse.json(member)
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.teamMember.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
