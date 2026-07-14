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
    console.log("[Sync] Triggered manual sync from AdultWork API (escort only, UK only)...")

    const searchParams = {
      ProfilesPerPage: 50,
      PageNumber: 1,
      IsEscort: true,
      CountryID: 158
    }

    const searchResponse = await adultWorkSearchProfiles(searchParams)
    const rawProfiles = searchResponse.Profiles || []

    // 1. Filter to ensure strictly UK country and Escort service only
    const profiles = rawProfiles.filter((profile: any) => {
      const isEscort = profile.IsEscort === true
      const isUK = profile.CountryID === "158" ||
                   profile.NationalityID === "158" ||
                   String(profile.NationalityID) === "158" ||
                   profile.NationalityISO2 === "UK" ||
                   profile.Country?.toLowerCase() === "united kingdom"
      return isEscort && isUK
    })

    let profilesSyncedCount = 0
    const syncedIds: number[] = []

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
          lastSynced: new Date(),
          active: true
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
          lastSynced: new Date(),
          active: true
        }
      })
      profilesSyncedCount++
      syncedIds.push(profile.UserID)
    }

    // 2. Purge other cached profiles that are not escorts or not in the UK
    await prisma.cachedProfile.deleteMany({
      where: {
        OR: [
          { isEscort: false },
          {
            NOT: {
              OR: [
                { country: { equals: 'United Kingdom' } },
                { nationalityISO2: { equals: 'UK' } }
              ]
            }
          }
        ]
      }
    })

    // 3. Mark matched profiles that are no longer found as inactive
    await prisma.cachedProfile.updateMany({
      where: {
        userId: { notIn: syncedIds },
        active: true
      },
      data: {
        active: false
      }
    })

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
