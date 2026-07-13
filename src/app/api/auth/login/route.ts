import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/session'
import { MOCK_PROFILES, isMockMode } from '@/lib/adultwork'
import { initializeDatabase } from '@/lib/init'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  await initializeDatabase()

  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const localUser = await prisma.user.findUnique({
      where: { username },
    })

    if (localUser) {
      const passwordMatch = await bcrypt.compare(password, localUser.passwordHash)
      if (passwordMatch) {
        setSession({
          userId: localUser.id,
          username: localUser.username,
          role: localUser.role,
          adultworkUserId: localUser.adultworkUserId,
          adultworkNickname: localUser.adultworkNickname,
          discreetMode: localUser.discreetMode,
        })
        return NextResponse.json({ success: true, user: { username: localUser.username, role: localUser.role } })
      }
    }

    const adultworkUserId = parseInt(username, 10)
    if (!isNaN(adultworkUserId)) {
      if (isMockMode()) {
        const mockProfile = MOCK_PROFILES.find(p => p.UserID === adultworkUserId)
        if (mockProfile && password === 'password') {
          let localAwUser = await prisma.user.findUnique({
            where: { username: mockProfile.NickName },
          })

          if (!localAwUser) {
            const defaultHash = await bcrypt.hash('password', 10)
            localAwUser = await prisma.user.create({
              data: {
                username: mockProfile.NickName,
                passwordHash: defaultHash,
                adultworkUserId: mockProfile.UserID,
                adultworkNickname: mockProfile.NickName,
                role: 'USER',
                discreetMode: true,
              }
            })
          }

          setSession({
            userId: localAwUser.id,
            username: localAwUser.username,
            role: localAwUser.role,
            adultworkUserId: localAwUser.adultworkUserId,
            adultworkNickname: localAwUser.adultworkNickname,
            discreetMode: localAwUser.discreetMode,
          })

          return NextResponse.json({ success: true, user: { username: localAwUser.username, role: localAwUser.role } })
        }
      } else {
        let nickname = `User_${adultworkUserId}`
        let localAwUser = await prisma.user.findUnique({
          where: { username: nickname },
        })

        if (!localAwUser) {
          const defaultHash = await bcrypt.hash('password', 10)
          localAwUser = await prisma.user.create({
            data: {
              username: nickname,
              passwordHash: defaultHash,
              adultworkUserId,
              adultworkNickname: nickname,
              role: 'USER',
              discreetMode: true,
            }
          })
        }

        setSession({
          userId: localAwUser.id,
          username: localAwUser.username,
          role: localAwUser.role,
          adultworkUserId: localAwUser.adultworkUserId,
          adultworkNickname: localAwUser.adultworkNickname,
          discreetMode: localAwUser.discreetMode,
        })

        return NextResponse.json({ success: true, user: { username: localAwUser.username, role: localAwUser.role } })
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error: any) {
    console.error("[Login API Error]", error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
