import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, setSession } from '@/lib/session'

export async function GET() {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { username: session.username }
  })

  return NextResponse.json({ discreetMode: user?.discreetMode ?? true })
}

export async function POST(request: Request) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { discreetMode } = await request.json()
    if (typeof discreetMode !== 'boolean') {
      return NextResponse.json({ error: 'discreetMode must be a boolean' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { username: session.username },
      data: { discreetMode }
    })

    setSession({
      ...session,
      discreetMode: updated.discreetMode
    })

    return NextResponse.json({ success: true, discreetMode: updated.discreetMode })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
