import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const where: any = {}

  const nickname = searchParams.get('nickname')
  if (nickname) {
    where.nickname = { contains: nickname, mode: 'insensitive' }
  }

  const gender = searchParams.get('gender')
  if (gender) {
    where.gender = gender
  }

  const minAge = searchParams.get('minAge')
  if (minAge) {
    where.age = { ...where.age, gte: parseInt(minAge, 10) }
  }
  const maxAge = searchParams.get('maxAge')
  if (maxAge) {
    where.age = { ...where.age, lte: parseInt(maxAge, 10) }
  }

  const country = searchParams.get('country')
  if (country) {
    where.country = { contains: country, mode: 'insensitive' }
  }
  const region = searchParams.get('region')
  if (region) {
    where.region = { contains: region, mode: 'insensitive' }
  }
  const county = searchParams.get('county')
  if (county) {
    where.county = { contains: county, mode: 'insensitive' }
  }
  const town = searchParams.get('town')
  if (town) {
    where.town = { contains: town, mode: 'insensitive' }
  }

  const services = [
    'isEscort',
    'isWebcam',
    'isPhoneChat',
    'isSMSChat',
    'isAlternative',
    'isOtherServices',
    'isDirectCam',
    'isDirectChat',
    'verified',
    'availableTodayEscort',
    'availableNowWebcam',
    'availableNowPhoneChat',
    'hasGallery',
    'hasPrivateGallery',
    'hasMovieClips',
    'hasMovieRentals',
    'hasSaleItems',
  ]

  services.forEach((service) => {
    const val = searchParams.get(service)
    if (val === 'true') {
      where[service] = true
    } else if (val === 'false') {
      where[service] = false
    }
  })

  const orderByParam = searchParams.get('orderBy') || 'lastUpdated-desc'
  let orderBy: any = { lastUpdated: 'desc' }

  if (orderByParam === 'age-asc') orderBy = { age: 'asc' }
  else if (orderByParam === 'age-desc') orderBy = { age: 'desc' }
  else if (orderByParam === 'views-desc') orderBy = { views: 'desc' }
  else if (orderByParam === 'nickname-asc') orderBy = { nickname: 'asc' }
  else if (orderByParam === 'nickname-desc') orderBy = { nickname: 'desc' }
  else if (orderByParam === 'rating-desc') orderBy = { ratingTotal: 'desc' }

  try {
    const count = await prisma.cachedProfile.count()
    if (count === 0 && process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      console.log("[Search API] Cache empty, auto-seeding cached profiles in mock mode...")
      const { MOCK_PROFILES } = await import('@/lib/adultwork')
      for (const p of MOCK_PROFILES) {
        await prisma.cachedProfile.upsert({
          where: { userId: p.UserID },
          update: {},
          create: {
            userId: p.UserID,
            nickname: p.NickName,
            summary: p.Summary,
            gender: p.Gender,
            age: p.Age,
            orientation: p.Orientation,
            country: p.Country,
            region: p.Region,
            county: p.County,
            town: p.Town,
            nationality: p.Nationality,
            nationalityISO2: p.NationalityISO2,
            views: p.Views,
            memberSince: p.MemberSince ? new Date(p.MemberSince) : null,
            lastLoggedIn: p.LastLoggedIn ? new Date(p.LastLoggedIn) : null,
            verified: p.Verified,
            isEscort: p.IsEscort,
            isWebcam: p.IsWebcam,
            isPhoneChat: p.IsPhoneChat,
            isSMSChat: p.IsSMSChat,
            isAlternative: p.IsAlternative,
            isOtherServices: p.IsOtherServices,
            isDirectCam: p.IsDirectCam,
            isDirectChat: p.IsDirectChat,
            availableTodayEscort: p.AvailableTodayEscort,
            availableNowWebcam: p.AvailableNowWebcam,
            availableNowPhoneChat: p.AvailableNowPhoneChat,
            hasGallery: p.HasGallery,
            hasPrivateGallery: p.HasPrivateGallery,
            hasMovieClips: p.HasMovieClips,
            hasMovieRentals: p.HasMovieRentals,
            hasSaleItems: p.HasSaleItems,
            ratingTotal: p.Ratings?.Total ?? 0,
            ratingPositive: p.Ratings?.Positive ?? 0,
            profileUrl: p.ProfileURL,
            thumbnailUrl: p.ProfileThumbnailURL,
            squareUrl: p.ProfileSquareURL,
            lastUpdated: p.LastUpdated ? new Date(p.LastUpdated) : null,
          }
        })
      }
    }

    const profiles = await prisma.cachedProfile.findMany({
      where,
      orderBy,
    })

    return NextResponse.json({ profiles })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
