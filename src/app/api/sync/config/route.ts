import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const config = await prisma.syncConfig.findUnique({ where: { id: 1 } })
  const logs = await prisma.syncLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10
  })

  return NextResponse.json({ config, logs })
}

export async function POST(request: Request) {
  const session = getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { interval } = await request.json()
    if (!['manual', 'hourly', 'daily', 'twicedaily'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval value' }, { status: 400 })
    }

    const updated = await prisma.syncConfig.update({
      where: { id: 1 },
      data: { interval }
    })

    return NextResponse.json({ success: true, config: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
