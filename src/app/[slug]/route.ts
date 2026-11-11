import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const cleanSlug = slug.toLowerCase()

  const socialMap: Record<string, string> = {
    'discord': 'social_discord',
    'youtube': 'social_youtube',
    'x': 'social_x',
    'twitter': 'social_x',
    'instagram': 'social_instagram',
    'facebook': 'social_facebook',
    'tiktok': 'social_tiktok',
  }

  const settingKey = socialMap[cleanSlug]
  if (!settingKey) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: settingKey }
  })

  if (!setting || !setting.value) {
    return new NextResponse('Not Found', { status: 404 })
  }

  return NextResponse.redirect(setting.value)
}
