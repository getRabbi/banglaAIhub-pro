import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD not set' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'ভুল পাসওয়ার্ড' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_auth', process.env.ADMIN_SECRET || 'secret', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
