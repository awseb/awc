import { NextResponse } from 'next/server'
import { adultWorkGetEmails } from '@/lib/adultwork'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawEmails = await adultWorkGetEmails()

    const conversationsMap: Record<number, {
      userId: number
      nickname: string
      messages: any[]
      lastMessageDate: string
      unreadCount: number
    }> = {}

    rawEmails.forEach((email) => {
      const otherId = email.OtherUserID
      const otherName = email.OtherNickname

      if (!conversationsMap[otherId]) {
        conversationsMap[otherId] = {
          userId: otherId,
          nickname: otherName,
          messages: [],
          lastMessageDate: email.SentDate,
          unreadCount: 0
        }
      }

      conversationsMap[otherId].messages.push(email)

      if (new Date(email.SentDate) > new Date(conversationsMap[otherId].lastMessageDate)) {
        conversationsMap[otherId].lastMessageDate = email.SentDate
      }

      if (email.FolderID === 0 && !email.Read) {
        conversationsMap[otherId].unreadCount++
      }
    })

    const conversations = Object.values(conversationsMap).map((convo) => {
      convo.messages.sort((a, b) => new Date(a.SentDate).getTime() - new Date(b.SentDate).getTime())
      return convo
    })

    conversations.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime())

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error("[Messages API Error]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
