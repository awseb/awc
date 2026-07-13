import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adultWorkSearchProfiles } from '@/lib/adultwork'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 })
  }

  const config = await prisma.syncConfig.findUnique({ where: { id: 1 } })
  if (config?.syncInProgress) {
    return NextResponse.json({ error: 'Sync is already in progress' }, { status: 400 })
  }

  const syncLog = await prisma.syncLog.create({
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
    }
  })

  await prisma.syncConfig.update({
    where: { id: 1 },
    data: { syncInProgress: true }
  })

  try {
    console.log("[Sync] Triggered manual sync from AdultWork API...")

    const searchParams = {
      ProfilesPerPage: 50,
      PageNumber: 1,
    }

    const searchResponse = await adultWorkSearchProfiles(searchParams)
    const profiles = searchResponse.Profiles || []

    let profilesSyncedCount = 0

    for (const profile of profiles) {
      await prisma.cachedProfile.upsert({
        where: { userId: profile.UserID },
        update: {
          nickname: profile.NickName,
          summary: profile.Summary,
          gender: profile.Gender,
          age: profile.Age,
          orientation: profile.Orientation,
          country: profile.Country,
          region: profile.Region,
          county: profile.County,
          town: profile.Town,
          nationality: profile.Nationality,
          nationalityISO2: profile.NationalityISO2,
          views: profile.Views,
          memberSince: profile.MemberSince ? new Date(profile.MemberSince) : null,
          lastLoggedIn: profile.LastLoggedIn ? new Date(profile.LastLoggedIn) : null,
          verified: profile.Verified,
          isEscort: profile.IsEscort,
          doesOutCalls: profile.DoesOutCalls,
          doesInCalls: profile.DoesInCalls,
          isWebcam: profile.IsWebcam,
          isPhoneChat: profile.IsPhoneChat,
          isSMSChat: profile.IsSMSChat,
          isAlternative: profile.IsAlternative,
          isOtherServices: profile.IsOtherServices,
          isDirectCam: profile.IsDirectCam,
          isDirectChat: profile.IsDirectChat,
          availableTodayEscort: profile.AvailableTodayEscort,
          availableNowWebcam: profile.AvailableNowWebcam,
          availableNowPhoneChat: profile.AvailableNowPhoneChat,
          hasGallery: profile.HasGallery,
          hasPrivateGallery: profile.HasPrivateGallery,
          hasMovieClips: profile.HasMovieClips,
          hasMovieRentals: profile.HasMovieRentals,
          hasSaleItems: profile.HasSaleItems,
          ratingTotal: profile.Ratings?.Total ?? 0,
          ratingPositive: profile.Ratings?.Positive ?? 0,
          ratingNeutral: profile.Ratings?.Neutral ?? 0,
          ratingNegative: profile.Ratings?.Negative ?? 0,
          profileUrl: profile.ProfileURL,
          thumbnailUrl: profile.ProfileThumbnailURL,
          squareUrl: profile.ProfileSquareURL,
          lastUpdated: profile.LastUpdated ? new Date(profile.LastUpdated) : null,
          lastSynced: new Date()
        },
        create: {
          userId: profile.UserID,
          nickname: profile.NickName,
          summary: profile.Summary,
          gender: profile.Gender,
          age: profile.Age,
          orientation: profile.Orientation,
          country: profile.Country,
          region: profile.Region,
          county: profile.County,
          town: profile.Town,
          nationality: profile.Nationality,
          nationalityISO2: profile.NationalityISO2,
          views: profile.Views,
          memberSince: profile.MemberSince ? new Date(profile.MemberSince) : null,
          lastLoggedIn: profile.LastLoggedIn ? new Date(profile.LastLoggedIn) : null,
          verified: profile.Verified,
          isEscort: profile.IsEscort,
          doesOutCalls: profile.DoesOutCalls,
          doesInCalls: profile.DoesInCalls,
          isWebcam: profile.IsWebcam,
          isPhoneChat: profile.IsPhoneChat,
          isSMSChat: profile.IsSMSChat,
          isAlternative: profile.IsAlternative,
          isOtherServices: profile.IsOtherServices,
          isDirectCam: profile.IsDirectCam,
          isDirectChat: profile.IsDirectChat,
          availableTodayEscort: profile.AvailableTodayEscort,
          availableNowWebcam: profile.AvailableNowWebcam,
          availableNowPhoneChat: profile.AvailableNowPhoneChat,
          hasGallery: profile.HasGallery,
          hasPrivateGallery: profile.HasPrivateGallery,
          hasMovieClips: profile.HasMovieClips,
          hasMovieRentals: profile.HasMovieRentals,
          hasSaleItems: profile.HasSaleItems,
          ratingTotal: profile.Ratings?.Total ?? 0,
          ratingPositive: profile.Ratings?.Positive ?? 0,
          ratingNeutral: profile.Ratings?.Neutral ?? 0,
          ratingNegative: profile.Ratings?.Negative ?? 0,
          profileUrl: profile.ProfileURL,
          thumbnailUrl: profile.ProfileThumbnailURL,
          squareUrl: profile.ProfileSquareURL,
          lastUpdated: profile.LastUpdated ? new Date(profile.LastUpdated) : null,
          lastSynced: new Date()
        }
      })
      profilesSyncedCount++
    }

    await prisma.syncConfig.update({
      where: { id: 1 },
      data: {
        syncInProgress: false,
        lastSyncedAt: new Date(),
      }
    })

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        profilesSynced: profilesSyncedCount
      }
    })

    return NextResponse.json({ success: true, profilesSynced: profilesSyncedCount })

  } catch (error: any) {
    console.error("[Sync API Error]", error)

    await prisma.syncConfig.update({
      where: { id: 1 },
      data: { syncInProgress: false }
    })

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error.message || 'Unknown sync error'
      }
    })

    return NextResponse.json({ error: error.message || 'Synchronization failed' }, { status: 500 })
  }
}
