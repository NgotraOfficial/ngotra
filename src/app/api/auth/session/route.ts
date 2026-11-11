import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ngotra-secret-key-change-in-production-2024'
)

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('session='))?.split('=')[1]

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return NextResponse.json({ user: { id: payload.id, username: payload.username, email: payload.email, role: payload.role, createdAt: payload.createdAt } })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
