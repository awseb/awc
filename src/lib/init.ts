import { prisma } from './prisma'
import { adultWorkSearchProfiles } from './adultwork'
import bcrypt from 'bcryptjs'

// Keep track of active background check interval globally in node process
let schedulerIntervalId: NodeJS.Timeout | null = null

export async function initializeDatabase() {
  try {
    // 1. Ensure Admin User
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' },
    })

    if (!adminUser) {
      console.log("[Db Init] Creating default admin user...")
      const passwordHash = await bcrypt.hash('adminpassword', 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash,
          role: 'ADMIN',
          discreetMode: true,
        },
      })
    }

    // 2. Ensure Sync Config
    const syncConfig = await prisma.syncConfig.findUnique({
      where: { id: 1 },
    })

    if (!syncConfig) {
      console.log("[Db Init] Creating default sync config...")
      await prisma.syncConfig.create({
        data: {
          id: 1,
          interval: 'manual',
          syncInProgress: false,
        },
      })
    }

    // 3. Start background scheduler (if not already running)
    startSyncScheduler()

    console.log("[Db Init] Database initialization complete.")
  } catch (error) {
    console.error("[Db Init] Error initializing database:", error)
  }
}

function startSyncScheduler() {
  const globalRef = global as any
  if (globalRef.__awc_scheduler_active__) {
    console.log("[Scheduler] Background scheduler loop is already active. Skipping duplicate initialization.")
    return
  }

  globalRef.__awc_scheduler_active__ = true
  console.log("[Scheduler] Initializing global background synchronization scheduler loop (polling every 60s)...")

  // Poll every 60 seconds
  setInterval(async () => {
    try {
      const config = await prisma.syncConfig.findUnique({ where: { id: 1 } })
      if (!config || config.interval === 'manual' || config.syncInProgress) {
        return
      }

      const now = new Date()
      let shouldSync = false
      const lastSynced = config.lastSyncedAt ? new Date(config.lastSyncedAt) : new Date(0)
      const diffMs = now.getTime() - lastSynced.getTime()

      if (config.interval === 'hourly' && diffMs >= 3600000) {
        shouldSync = true
      } else if (config.interval === 'daily' && diffMs >= 86400000) {
        shouldSync = true
      } else if (config.interval === 'twicedaily' && diffMs >= 43200000) {
        shouldSync = true
      }

      if (shouldSync) {
        console.log(`[Scheduler] Automatic scheduler triggered sync event for interval frequency: ${config.interval}`)
        await executeBackgroundSync()
      }
    } catch (err) {
      console.error("[Scheduler Error] Polling check failed:", err)
    }
  }, 60000)
}

async function executeBackgroundSync() {
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

    console.log(`[Scheduler] Sync successful. Updated ${profilesSyncedCount} cached profiles.`)

  } catch (error: any) {
    console.error("[Scheduler Error] Background sync failed:", error)

    await prisma.syncConfig.update({
      where: { id: 1 },
      data: { syncInProgress: false }
    })

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error.message || 'Background scheduler sync exception'
      }
    })
  }
}
