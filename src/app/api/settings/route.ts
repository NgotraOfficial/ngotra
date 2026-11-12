import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json(Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value])))
}

export async function PUT(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 })
  }

  // Filter out null/undefined values and numeric keys from arrays
  const validEntries = Object.entries(body).filter(([key, value]) => {
    return key && !isNaN(Number(key)) === false && value !== null && value !== undefined
  })

  console.log('Saving settings:', validEntries)

  const results = await Promise.all(
    validEntries.map(async ([key, value]) => {
      try {
        return await prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) }
        })
      } catch (err) {
        console.error(`Error saving setting ${key}:`, err)
        return null
      }
    })
  )

  const updated = results.filter(r => r !== null).length
  return NextResponse.json({ success: true, updated })
}
