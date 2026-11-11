import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const textBlocks = await prisma.textBlock.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json(textBlocks)
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { key, content } = body

  if (!key || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const textBlock = await prisma.textBlock.upsert({
    where: { key },
    update: { content },
    create: { key, content },
  })

  return NextResponse.json(textBlock)
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }

  await prisma.textBlock.delete({ where: { key } })
  return NextResponse.json({ success: true })
}
