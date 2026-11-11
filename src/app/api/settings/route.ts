import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json(Object.fromEntries(settings.map(s => [s.key, s.value])))
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const results = await Promise.all(
    Object.entries(body).map(async ([key, value]) => {
      return prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) }
      })
    })
  )

  return NextResponse.json({ success: true, updated: results.length })
}
