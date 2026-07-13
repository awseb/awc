import { cookies } from 'next/headers'

export interface SessionData {
  userId: number | null
  username: string
  role: string // "ADMIN" | "USER"
  adultworkUserId: number | null
  adultworkNickname: string | null
  discreetMode: boolean
}

const SESSION_COOKIE_NAME = 'awc_session'

export function getSession(): SessionData | null {
  const cookieStore = cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)
  if (!cookie) return null

  try {
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString('utf-8'))
    return data as SessionData
  } catch (e) {
    return null
  }
}

export function setSession(data: SessionData) {
  const cookieStore = cookies()
  const value = Buffer.from(JSON.stringify(data)).toString('base64')
  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export function clearSession() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
