import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const serviceSlug = searchParams.get('service')
  if (serviceSlug) {
    const plans = await prisma.plan.findMany({ where: { serviceSlug }, orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(plans)
  }
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...data } = body
  const plan = await prisma.plan.create({ data })
  return NextResponse.json(plan, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const plan = await prisma.plan.update({ where: { id }, data })
  return NextResponse.json(plan)
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
