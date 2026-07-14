import { prisma } from './prisma'

export interface AdultWorkProfile {
  LocationProximityMiles: number
  LocationProximityKilometres: number
  HasProfileThumbnail: boolean
  ProfileThumbnailSafe: boolean
  ProfileThumbnailURL: string | null
  ProfileSquareSafe: boolean
  ProfileSquareURL: string | null
  UserID: number
  NickName: string
  Summary: string | null
  Gender: string
  Age: number
  Orientation: string
  Country: string
  Region: string | null
  County: string | null
  Town: string | null
  NationalityID: string | null
  Nationality: string | null
  NationalityISO2: string | null
  Views: number
  MemberSince: string
  LastLoggedIn: string
  Verified: boolean
  IsEscort: boolean
  DoesOutCalls: boolean
  DoesInCalls: boolean
  IsWebcam: boolean
  IsPhoneChat: boolean
  IsSMSChat: boolean
  IsAlternative: boolean
  IsOtherServices: boolean
  IsDirectCam: boolean
  IsDirectChat: boolean
  AvailableTodayEscort: boolean
  AvailableNowWebcam: boolean
  AvailableNowPhoneChat: boolean
  HasGallery: boolean
  HasPrivateGallery: boolean
  HasMovieClips: boolean
  HasMovieRentals: boolean
  HasSaleItems: boolean
  IsCouple: boolean
  InGroup: boolean
  GroupName: string | null
  GroupID: number | null
  ProfileURL: string | null
  RatingsURL: string | null
  HasBlog: boolean
  LastUpdated: string
  IsBlacklisted: boolean
  IsOnTour: boolean
  HasPhoneNumber: boolean
  Ratings?: {
    Total: number
    Positive: number
    Neutral: number
    Negative: number
    Ratings: number
    Disputes: number
  }
}

export interface AdultWorkEmail {
  EmailID: number
  Read: boolean
  Subject: string
  Body: string
  SentDate: string
  OtherUserID: number
  OtherNickname: string
  FolderID: number // 0 for Inbox, -1 for Sent
  Disclaimer?: string
}

export const dynamic = 'force-dynamic';

// Global variable to keep mock emails in-memory for live-session simulation
let MOCK_EMAILS: AdultWorkEmail[] = []

// Initialize rich, realistic mock messages
function initMockEmails() {
  if (MOCK_EMAILS.length > 0) return

  const participants = [
    { id: 10101, name: "Alexandra_x" },
    { id: 20202, name: "JessicaB" },
    { id: 30303, name: "MarcusElite" },
    { id: 40404, name: "ChloeLondon" }
  ]

  const subjects = [
    "Corporate Booking Inquiry - Thurs Afternoon",
    "RE: Availability for tomorrow?",
    "Direct cam session update",
    "Just a quick note to say thank you"
  ]

  const conversations = [
    [
      { incoming: true, text: "Hello! Thank you for getting in touch. Yes, I am available this Thursday afternoon between 2 PM and 5 PM. Do you have a preferred location in the City?", daysAgo: 2, hour: 10 },
      { incoming: false, text: "Excellent. I was thinking of the hotel lounge or a private meeting room near Bank. Does 3 PM work for you?", daysAgo: 2, hour: 11 },
      { incoming: true, text: "3 PM near Bank is perfect. Let's confirm details. My outcall rates are standard as listed on my profile.", daysAgo: 2, hour: 11.5 },
      { incoming: false, text: "Understood. I will book the meeting room and send the precise details shortly. See you Thursday.", daysAgo: 1, hour: 9 },
      { incoming: true, text: "Perfect, looking forward to it. Let me know if you need anything else.", daysAgo: 1, hour: 9.5 }
    ],
    [
      { incoming: true, text: "Hi there! I saw you viewed my profile. Just to let you know, I am online for webcam or chat right now if you are free.", daysAgo: 3, hour: 20 },
      { incoming: false, text: "Hi Jessica, thanks for reaching out. I'm currently at work but might log on later tonight.", daysAgo: 3, hour: 21 },
      { incoming: true, text: "No worries! I should be online until midnight. Talk later x", daysAgo: 3, hour: 21.1 }
    ],
    [
      { incoming: true, text: "Hi, thanks for the message. I specialize in premium outcalls in London. What date did you have in mind?", daysAgo: 5, hour: 14 },
      { incoming: false, text: "I'm looking for a session on Friday evening, around 8 PM.", daysAgo: 5, hour: 15 },
      { incoming: true, text: "Friday at 8 PM is currently open. Let me know if you would like me to lock that slot in.", daysAgo: 4, hour: 10 }
    ],
    [
      { incoming: true, text: "Hello, hope you are having a productive day! I saw you are subscribed to my gallery. I've just uploaded 10 new corporate-themed photos. Hope you like them!", daysAgo: 6, hour: 11 },
      { incoming: false, text: "Thanks Chloe, they look great! Very elegant.", daysAgo: 6, hour: 12 }
    ]
  ]

  let emailIdCounter = 1000

  conversations.forEach((convo, idx) => {
    const p = participants[idx % participants.length]
    const subj = subjects[idx % subjects.length]

    convo.forEach((msg) => {
      const date = new Date()
      date.setDate(date.getDate() - msg.daysAgo)
      date.setHours(Math.floor(msg.hour), Math.round((msg.hour % 1) * 60), 0, 0)

      MOCK_EMAILS.push({
        EmailID: emailIdCounter++,
        Read: msg.incoming ? true : false,
        Subject: subj,
        Body: msg.text,
        SentDate: date.toISOString(),
        OtherUserID: p.id,
        OtherNickname: p.name,
        FolderID: msg.incoming ? 0 : -1
      })
    })
  })
}

// Detailed Mock Profiles representing adultwork members
export const MOCK_PROFILES: AdultWorkProfile[] = [
  {
    LocationProximityMiles: 0,
    LocationProximityKilometres: 0,
    HasProfileThumbnail: true,
    ProfileThumbnailSafe: true,
    ProfileThumbnailURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
    ProfileSquareSafe: true,
    ProfileSquareURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
    UserID: 10101,
    NickName: "Alexandra_x",
    Summary: "Elite high-class companion offering elegant, professional and intelligent companionship in central London.",
    Gender: "Female",
    Age: 25,
    Orientation: "Straight",
    Country: "United Kingdom",
    Region: "London",
    County: "Greater London",
    Town: "Mayfair",
    NationalityID: "158",
    Nationality: "British",
    NationalityISO2: "UK",
    Views: 145020,
    MemberSince: "2020-04-12T10:20:00.000Z",
    LastLoggedIn: new Date().toISOString(),
    Verified: true,
    IsEscort: true,
    DoesOutCalls: true,
    DoesInCalls: true,
    IsWebcam: false,
    IsPhoneChat: true,
    IsSMSChat: true,
    IsAlternative: false,
    IsOtherServices: false,
    IsDirectCam: false,
    IsDirectChat: false,
    AvailableTodayEscort: true,
    AvailableNowWebcam: false,
    AvailableNowPhoneChat: true,
    HasGallery: true,
    HasPrivateGallery: true,
    HasMovieClips: false,
    HasMovieRentals: false,
    HasSaleItems: false,
    IsCouple: false,
    InGroup: false,
    GroupName: null,
    GroupID: null,
    ProfileURL: "https://www.adultwork.com/10101",
    RatingsURL: "https://www.adultwork.com/dlgExtRatings.asp?U=10101",
    HasBlog: true,
    LastUpdated: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    IsBlacklisted: false,
    IsOnTour: false,
    HasPhoneNumber: true,
    Ratings: {
      Total: 142,
      Positive: 142,
      Neutral: 0,
      Negative: 0,
      Ratings: 142,
      Disputes: 0
    }
  },
  {
    LocationProximityMiles: 0,
    LocationProximityKilometres: 0,
    HasProfileThumbnail: true,
    ProfileThumbnailSafe: true,
    ProfileThumbnailURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    ProfileSquareSafe: true,
    ProfileSquareURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400",
    UserID: 20202,
    NickName: "JessicaB",
    Summary: "Sensual and friendly young lady. Let's make some amazing memories together. Highly discreet, classy outcalls.",
    Gender: "Female",
    Age: 22,
    Orientation: "Bisexual",
    Country: "United Kingdom",
    Region: "London",
    County: "Greater London",
    Town: "Kensington",
    NationalityID: "158",
    Nationality: "British",
    NationalityISO2: "UK",
    Views: 92840,
    MemberSince: "2021-08-15T14:30:00.000Z",
    LastLoggedIn: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
    Verified: true,
    IsEscort: true,
    DoesOutCalls: true,
    DoesInCalls: false,
    IsWebcam: true,
    IsPhoneChat: true,
    IsSMSChat: true,
    IsAlternative: false,
    IsOtherServices: false,
    IsDirectCam: true,
    IsDirectChat: true,
    AvailableTodayEscort: false,
    AvailableNowWebcam: true,
    AvailableNowPhoneChat: true,
    HasGallery: true,
    HasPrivateGallery: false,
    HasMovieClips: true,
    HasMovieRentals: false,
    HasSaleItems: false,
    IsCouple: false,
    InGroup: false,
    GroupName: null,
    GroupID: null,
    ProfileURL: "https://www.adultwork.com/20202",
    RatingsURL: "https://www.adultwork.com/dlgExtRatings.asp?U=20202",
    HasBlog: false,
    LastUpdated: new Date(Date.now() - 12 * 3600000).toISOString(),
    IsBlacklisted: false,
    IsOnTour: false,
    HasPhoneNumber: true,
    Ratings: {
      Total: 45,
      Positive: 44,
      Neutral: 1,
      Negative: 0,
      Ratings: 45,
      Disputes: 0
    }
  },
  {
    LocationProximityMiles: 0,
    LocationProximityKilometres: 0,
    HasProfileThumbnail: true,
    ProfileThumbnailSafe: true,
    ProfileThumbnailURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    ProfileSquareSafe: true,
    ProfileSquareURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400",
    UserID: 30303,
    NickName: "MarcusElite",
    Summary: "Distinguished gentleman escort offering first-class, highly athletic and discreet services for ladies & couples.",
    Gender: "Male",
    Age: 29,
    Orientation: "Straight",
    Country: "United Kingdom",
    Region: "London",
    County: "Greater London",
    Town: "Chelsea",
    NationalityID: "158",
    Nationality: "British",
    NationalityISO2: "UK",
    Views: 32410,
    MemberSince: "2019-11-01T09:00:00.000Z",
    LastLoggedIn: new Date(Date.now() - 4 * 3600000).toISOString(),
    Verified: true,
    IsEscort: true,
    DoesOutCalls: true,
    DoesInCalls: true,
    IsWebcam: false,
    IsPhoneChat: false,
    IsSMSChat: false,
    IsAlternative: true,
    IsOtherServices: false,
    IsDirectCam: false,
    IsDirectChat: false,
    AvailableTodayEscort: true,
    AvailableNowWebcam: false,
    AvailableNowPhoneChat: false,
    HasGallery: true,
    HasPrivateGallery: false,
    HasMovieClips: false,
    HasMovieRentals: false,
    HasSaleItems: false,
    IsCouple: false,
    InGroup: false,
    GroupName: null,
    GroupID: null,
    ProfileURL: "https://www.adultwork.com/30303",
    RatingsURL: "https://www.adultwork.com/dlgExtRatings.asp?U=30303",
    HasBlog: false,
    LastUpdated: new Date(Date.now() - 86400000).toISOString(),
    IsBlacklisted: false,
    IsOnTour: false,
    HasPhoneNumber: false,
    Ratings: {
      Total: 29,
      Positive: 29,
      Neutral: 0,
      Negative: 0,
      Ratings: 29,
      Disputes: 0
    }
  },
  {
    LocationProximityMiles: 0,
    LocationProximityKilometres: 0,
    HasProfileThumbnail: true,
    ProfileThumbnailSafe: true,
    ProfileThumbnailURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200",
    ProfileSquareSafe: true,
    ProfileSquareURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400",
    UserID: 40404,
    NickName: "ChloeLondon",
    Summary: "Stunning independent therapist. Providing sensual oil massages and luxury stress-relief in Mayfair.",
    Gender: "Female",
    Age: 24,
    Orientation: "Straight",
    Country: "United Kingdom",
    Region: "London",
    County: "Greater London",
    Town: "Mayfair",
    NationalityID: "158",
    Nationality: "British",
    NationalityISO2: "UK",
    Views: 110400,
    MemberSince: "2022-01-20T12:00:00.000Z",
    LastLoggedIn: new Date().toISOString(),
    Verified: true,
    IsEscort: true,
    DoesOutCalls: true,
    DoesInCalls: true,
    IsWebcam: true,
    IsPhoneChat: false,
    IsSMSChat: true,
    IsAlternative: false,
    IsOtherServices: true,
    IsDirectCam: true,
    IsDirectChat: false,
    AvailableTodayEscort: true,
    AvailableNowWebcam: false,
    AvailableNowPhoneChat: false,
    HasGallery: true,
    HasPrivateGallery: true,
    HasMovieClips: false,
    HasMovieRentals: false,
    HasSaleItems: false,
    IsCouple: false,
    InGroup: false,
    GroupName: null,
    GroupID: null,
    ProfileURL: "https://www.adultwork.com/40404",
    RatingsURL: "https://www.adultwork.com/dlgExtRatings.asp?U=40404",
    HasBlog: false,
    LastUpdated: new Date(Date.now() - 10 * 60000).toISOString(),
    IsBlacklisted: false,
    IsOnTour: false,
    HasPhoneNumber: true,
    Ratings: {
      Total: 78,
      Positive: 77,
      Neutral: 1,
      Negative: 0,
      Ratings: 78,
      Disputes: 0
    }
  }
]

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.ADULTWORK_API_KEY
}

function getHeaders(accessToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (accessToken) {
    headers['Authorization'] = `bearer ${accessToken}`
  } else {
    headers['X-ApiKey'] = process.env.ADULTWORK_API_KEY || ''
    if (process.env.ADULTWORK_API_SECRET) {
      headers['X-ApiSecret'] = process.env.ADULTWORK_API_SECRET
    }
  }
  return headers
}

export async function adultWorkSearchProfiles(params: Record<string, any>, accessToken?: string): Promise<{ PageCount: number, PageNumber: number, ProfilesTotal: number, ProfilesPerPage: number, Profiles: AdultWorkProfile[] }> {
  if (isMockMode()) {
    console.log("[AdultWork Mock API] Searching profiles with params:", params)
    
    let results = [...MOCK_PROFILES]

    if (params.Nickname) {
      results = results.filter(p => p.NickName.toLowerCase().includes(params.Nickname.toLowerCase()))
    }
    if (params.GenderIDs) {
      const genderMap: Record<string, string> = { "1": "Female", "2": "Male", "3": "Trans" }
      const genders = String(params.GenderIDs).split(',').map(id => genderMap[id]).filter(Boolean)
      if (genders.length > 0) {
        results = results.filter(p => genders.includes(p.Gender))
      }
    }
    if (params.IsEscort === true || params.IsEscort === "true") {
      results = results.filter(p => p.IsEscort)
    }
    if (params.IsWebcam === true || params.IsWebcam === "true") {
      results = results.filter(p => p.IsWebcam)
    }
    if (params.IsPhoneChat === true || params.IsPhoneChat === "true") {
      results = results.filter(p => p.IsPhoneChat)
    }
    if (params.Town) {
      results = results.filter(p => p.Town?.toLowerCase().includes(params.Town.toLowerCase()))
    }
    if (params.MinAge) {
      results = results.filter(p => p.Age >= Number(params.MinAge))
    }
    if (params.MaxAge) {
      results = results.filter(p => p.Age <= Number(params.MaxAge))
    }

    return {
      PageCount: 1,
      PageNumber: 1,
      ProfilesTotal: results.length,
      ProfilesPerPage: 50,
      Profiles: results
    }
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"
  
  // Format parameters to exactly match what the AdultWork API expectations are.
  // Passing empty filter fields can sometimes trigger 500 errors on certain Sandboxes,
  // so we default to IsEscort=true if no other roles are specified.
  const isAnyRoleSpecified = params.IsEscort || params.IsWebcam || params.IsPhoneChat || params.IsSMSChat || params.IsAlternative || params.IsOtherServices
  const bodyParams = {
    IsEscort: isAnyRoleSpecified ? undefined : true,
    ProfilesPerPage: 50,
    PageNumber: 1,
    ...params
  }

  // Use the exact PascalCase path: /v1/Search/SearchProfiles
  const response = await fetch(`${baseUrl}/v1/Search/SearchProfiles`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify(bodyParams)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AdultWork API Search Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function adultWorkGetProfileDetails(userId: number, accessToken?: string): Promise<AdultWorkProfile> {
  if (isMockMode()) {
    const p = MOCK_PROFILES.find(profile => profile.UserID === userId)
    if (!p) throw new Error("Profile not found")
    return p
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"
  
  // Use exact PascalCase path: /v1/Profile/GetProfileDetails
  const response = await fetch(`${baseUrl}/v1/Profile/GetProfileDetails?UserID=${userId}`, {
    method: 'GET',
    headers: getHeaders(accessToken)
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Profile Details Error: ${response.status}`)
  }

  return response.json()
}

export async function adultWorkGetEmails(accessToken?: string): Promise<AdultWorkEmail[]> {
  initMockEmails()

  if (isMockMode()) {
    return MOCK_EMAILS
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  try {
    const inboxUrl = `${baseUrl}/v1/Email/GetEmails?FolderID=0&ReturnEmailBody=true&EmailsPerPage=100`
    const sentUrl = `${baseUrl}/v1/Email/GetEmails?FolderID=-1&ReturnEmailBody=true&EmailsPerPage=100`

    const [inboxRes, sentRes] = await Promise.all([
      fetch(inboxUrl, { method: 'GET', headers: getHeaders(accessToken) }),
      fetch(sentUrl, { method: 'GET', headers: getHeaders(accessToken) })
    ])

    let emails: AdultWorkEmail[] = []

    if (inboxRes.ok) {
      const data = await inboxRes.json()
      if (data && data.Emails) {
        emails = emails.concat(data.Emails.map((e: any) => ({ ...e, FolderID: 0 })))
      }
    }

    if (sentRes.ok) {
      const data = await sentRes.json()
      if (data && data.Emails) {
        emails = emails.concat(data.Emails.map((e: any) => ({ ...e, FolderID: -1 })))
      }
    }

    return emails
  } catch (error) {
    console.error("Error fetching emails from live API:", error)
    return []
  }
}

export async function adultWorkSendEmail(toUserId: number, subject: string, body: string, accessToken?: string): Promise<{ Success: boolean, EmailID?: number }> {
  initMockEmails()

  if (isMockMode()) {
    const participant = MOCK_PROFILES.find(p => p.UserID === toUserId)
    const newEmail: AdultWorkEmail = {
      EmailID: Math.floor(Math.random() * 100000),
      Read: true,
      Subject: subject,
      Body: body,
      SentDate: new Date().toISOString(),
      OtherUserID: toUserId,
      OtherNickname: participant ? participant.NickName : `User_${toUserId}`,
      FolderID: -1
    }

    MOCK_EMAILS.push(newEmail)

    setTimeout(() => {
      MOCK_EMAILS.push({
        EmailID: newEmail.EmailID + 1,
        Read: false,
        Subject: `RE: ${subject}`,
        Body: `Hi! Thank you for your message. I received it: "${body}". I will review this and get back to you inside our corporate client shortly!`,
        SentDate: new Date(Date.now() + 5000).toISOString(),
        OtherUserID: toUserId,
        OtherNickname: participant ? participant.NickName : `User_${toUserId}`,
        FolderID: 0
      })
    }, 1000)

    return { Success: true, EmailID: newEmail.EmailID }
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  const response = await fetch(`${baseUrl}/v1/Email/Send`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify({
      ToUserID: toUserId,
      Subject: subject,
      Body: body
    })
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Send Email Error: ${response.status}`)
  }

  const data = await response.json()
  return { Success: true, EmailID: data?.EmailID }
}

export interface HotListDetails {
  UserID: number
  ListID: number
  ListName: string
  UserName: string
}

export interface HotListMember {
  UserID: number
  InteractionCount: number
  UserName: string
  Notes: string | null
  LastUpdated: string
  LastInteractionDate: string
  Profile?: any
}

export interface HotList {
  HotListDetails: HotListDetails
  HotListMembers: HotListMember[]
}

// In-memory mock hotlists state
let MOCK_HOTLISTS: HotList[] = [
  {
    HotListDetails: {
      UserID: 999,
      ListID: 111,
      ListName: "AW Favorites",
      UserName: "admin"
    },
    HotListMembers: [
      {
        UserID: 10101,
        InteractionCount: 1,
        UserName: "Alexandra_x",
        Notes: "Outstanding companion",
        LastUpdated: new Date().toISOString(),
        LastInteractionDate: new Date().toISOString(),
      },
      {
        UserID: 20202,
        InteractionCount: 0,
        UserName: "JessicaB",
        Notes: null,
        LastUpdated: new Date().toISOString(),
        LastInteractionDate: "0001-01-01T00:00:00",
      }
    ]
  },
  {
    HotListDetails: {
      UserID: 999,
      ListID: 112,
      ListName: "Elite Escorts",
      UserName: "admin"
    },
    HotListMembers: [
      {
        UserID: 40404,
        InteractionCount: 3,
        UserName: "ChloeLondon",
        Notes: "Brilliant Mayfair escort",
        LastUpdated: new Date().toISOString(),
        LastInteractionDate: new Date().toISOString(),
      }
    ]
  }
]

export async function adultWorkGetHotLists(accessToken?: string): Promise<HotList[]> {
  if (isMockMode()) {
    return MOCK_HOTLISTS
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  const response = await fetch(`${baseUrl}/v1/HotLists/GetHotLists?ReturnMemberProfiles=true`, {
    method: 'GET',
    headers: getHeaders(accessToken)
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Get Hotlists Error: ${response.status}`)
  }

  return response.json()
}

export async function adultWorkAddUserToHotList(userId: number, listId: number, accessToken?: string): Promise<{ Success: boolean }> {
  if (isMockMode()) {
    const list = MOCK_HOTLISTS.find(l => l.HotListDetails.ListID === listId)
    if (list) {
      const alreadyMember = list.HotListMembers.some(m => m.UserID === userId)
      if (!alreadyMember) {
        const profile = MOCK_PROFILES.find(p => p.UserID === userId)
        list.HotListMembers.push({
          UserID: userId,
          InteractionCount: 0,
          UserName: profile ? profile.NickName : `User_${userId}`,
          Notes: null,
          LastUpdated: new Date().toISOString(),
          LastInteractionDate: "0001-01-01T00:00:00"
        })
      }
    }
    return { Success: true }
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  const response = await fetch(`${baseUrl}/v1/HotLists/AddUserToHotList`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify({
      UserID: userId,
      ListID: listId
    })
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Add To Hotlist Error: ${response.status}`)
  }

  return { Success: true }
}

export async function adultWorkRemoveUserFromHotList(userId: number, listId: number, accessToken?: string): Promise<{ Success: boolean }> {
  if (isMockMode()) {
    const list = MOCK_HOTLISTS.find(l => l.HotListDetails.ListID === listId)
    if (list) {
      list.HotListMembers = list.HotListMembers.filter(m => m.UserID !== userId)
    }
    return { Success: true }
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  const response = await fetch(`${baseUrl}/v1/HotLists/RemoveUserFromHotList`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify({
      UserID: userId,
      ListID: listId
    })
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Remove From Hotlist Error: ${response.status}`)
  }

  return { Success: true }
}

export async function adultWorkRemoveHotList(listId: number, accessToken?: string): Promise<{ Success: boolean }> {
  if (isMockMode()) {
    MOCK_HOTLISTS = MOCK_HOTLISTS.filter(l => l.HotListDetails.ListID !== listId)
    return { Success: true }
  }

  const isSandbox = true
  const baseUrl = isSandbox ? "https://api-sandbox.adultwork.com" : "https://api.adultwork.com"

  const response = await fetch(`${baseUrl}/v1/HotLists/RemoveHotList`, {
    method: 'POST',
    headers: getHeaders(accessToken),
    body: JSON.stringify({
      ListID: listId
    })
  })

  if (!response.ok) {
    throw new Error(`AdultWork API Remove Hotlist Error: ${response.status}`)
  }

  return { Success: true }
}

export async function adultWorkCreateHotList(listName: string, accessToken?: string): Promise<{ Success: boolean, ListID: number }> {
  if (isMockMode()) {
    const newListId = Math.floor(Math.random() * 1000) + 200
    MOCK_HOTLISTS.push({
      HotListDetails: {
        UserID: 999,
        ListID: newListId,
        ListName: listName,
        UserName: "admin"
      },
      HotListMembers: []
    })
    return { Success: true, ListID: newListId }
  }
  return { Success: false, ListID: 0 }
}
