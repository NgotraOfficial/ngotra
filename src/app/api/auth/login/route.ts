import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ngotra-secret-key-change-in-production-2024'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.error('[Login] User not found:', email)
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      console.error('[Login] Password mismatch for:', email)
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(SECRET)

    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user.id, username: user.username, email: user.email, role: user.role } },
      { status: 200 }
    )

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
