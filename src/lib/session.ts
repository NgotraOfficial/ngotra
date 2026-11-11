import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ngotra-secret-key-change-in-production-2024'
)

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface Session {
  user: User
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      user: {
        id: payload.id as string,
        username: payload.username as string,
        email: payload.email as string,
        role: payload.role as string,
      },
    }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}
