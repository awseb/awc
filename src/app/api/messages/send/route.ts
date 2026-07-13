import { NextResponse } from 'next/server'
import { adultWorkSendEmail } from '@/lib/adultwork'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { toUserId, subject, body } = await request.json()

    if (!toUserId || !body) {
      return NextResponse.json({ error: 'toUserId and body are required' }, { status: 400 })
    }

    const defaultSubject = subject || "Inquiry"
    const response = await adultWorkSendEmail(Number(toUserId), defaultSubject, body)

    return NextResponse.json({ success: true, emailId: response.EmailID })
  } catch (error: any) {
    console.error("[Send Message API Error]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
