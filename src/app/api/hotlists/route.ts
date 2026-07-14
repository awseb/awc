import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  adultWorkGetHotLists,
  adultWorkAddUserToHotList,
  adultWorkRemoveUserFromHotList,
  adultWorkRemoveHotList,
  adultWorkCreateHotList
} from '@/lib/adultwork'

export async function GET() {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const hotlists = await adultWorkGetHotLists()
    return NextResponse.json({ hotlists })
  } catch (error: any) {
    console.error("[Hotlists GET Error]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, userId, listId, listName } = body

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }

    if (action === 'add') {
      if (!userId || !listId) {
        return NextResponse.json({ error: 'userId and listId are required' }, { status: 400 })
      }
      await adultWorkAddUserToHotList(Number(userId), Number(listId))
      return NextResponse.json({ success: true })
    }

    if (action === 'remove-user') {
      if (!userId || !listId) {
        return NextResponse.json({ error: 'userId and listId are required' }, { status: 400 })
      }
      await adultWorkRemoveUserFromHotList(Number(userId), Number(listId))
      return NextResponse.json({ success: true })
    }

    if (action === 'remove-list') {
      if (!listId) {
        return NextResponse.json({ error: 'listId is required' }, { status: 400 })
      }
      await adultWorkRemoveHotList(Number(listId))
      return NextResponse.json({ success: true })
    }

    if (action === 'create') {
      if (!listName) {
        return NextResponse.json({ error: 'listName is required' }, { status: 400 })
      }
      const response = await adultWorkCreateHotList(listName)
      return NextResponse.json({ success: true, listId: response.ListID })
    }

    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
  } catch (error: any) {
    console.error("[Hotlists POST Error]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
