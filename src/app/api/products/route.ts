import { NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getSession()
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('serviceId')

  if (serviceId) {
    const products = await prisma.product.findMany({
      where: { serviceId },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(products)
  }

  if (session?.user?.role === 'ADMIN') {
    const products = await prisma.product.findMany({
      include: { service: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(products)
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...data } = body
  const product = await prisma.product.create({ data })
  return NextResponse.json(product, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const product = await prisma.product.update({ where: { id }, data })
  return NextResponse.json(product)
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
