'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, ShieldCheck, HelpCircle, ArrowUpDown, RefreshCw, X, AlertCircle } from 'lucide-react'

interface CachedProfile {
  userId: number
  nickname: string
  summary: string | null
  gender: string | null
  age: number | null
  orientation: string | null
  country: string | null
  region: string | null
  county: string | null
  town: string | null
  nationality: string | null
  views: number | null
  memberSince: string | null
  lastLoggedIn: string | null
  verified: boolean
  isEscort: boolean
  doesOutCalls: boolean
  doesInCalls: boolean
  isWebcam: boolean
  isPhoneChat: boolean
  isSMSChat: boolean
  isAlternative: boolean
  isOtherServices: boolean
  isDirectCam: boolean
  isDirectChat: boolean
  availableTodayEscort: boolean
  availableNowWebcam: boolean
  availableNowPhoneChat: boolean
  hasGallery: boolean
  hasPrivateGallery: boolean
  hasMovieClips: boolean
  hasMovieRentals: boolean
  hasSaleItems: boolean
  ratingTotal: number
  ratingPositive: number
  ratingNeutral: number
  ratingNegative: number
  profileUrl: string | null
  thumbnailUrl: string | null
  squareUrl: string | null
  lastUpdated: string | null
}

export default function ProfilesBrowser() {
  const [profiles, setProfiles] = useState<CachedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [discreetMode, setDiscreetMode] = useState<boolean>(true)
  const [selectedProfile, setSelectedProfile] = useState<CachedProfile | null>(null)

  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [town, setTown] = useState('')
  const [orderBy, setOrderBy] = useState('lastUpdated-desc')

  const [filterBooleans, setFilterBooleans] = useState<Record<string, boolean>>({
    verified: false,
    availableTodayEscort: false,
    hasGallery: false,
    hasPrivateGallery: false,
  })

  const [hotlists, setHotlists] = useState<any[]>([])
  const [loadingHotlists, setLoadingHotlists] = useState(false)

  const [showFilters, setShowFilters] = useState(true)

  const fetchHotlists = async () => {
    setLoadingHotlists(true)
    try {
      const res = await fetch('/api/hotlists')
      if (res.ok) {
        const data = await res.json()
        setHotlists(data.hotlists || [])
      }
    } catch (err) {
      console.error("Error fetching hotlists:", err)
    } finally {
      setLoadingHotlists(false)
    }
  }

  const handleToggleHotlist = async (listId: number, isMember: boolean) => {
    if (!selectedProfile) return
    try {
      const res = await fetch('/api/hotlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isMember ? 'remove-user' : 'add',
          userId: selectedProfile.userId,
          listId
        })
      })
      if (res.ok) {
        await fetchHotlists()
      } else {
        const errorData = await res.json()
        alert(`Failed to update hotlist: ${errorData.error || 'Server error'}`)
      }
    } catch (err) {
      console.error("Error toggling hotlist:", err)
      alert("Error updating hotlist.")
    }
  }

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (nickname) query.set('nickname', nickname)
      if (gender) query.set('gender', gender)
      if (minAge) query.set('minAge', minAge)
      if (maxAge) query.set('maxAge', maxAge)
      if (town) query.set('town', town)
      if (orderBy) query.set('orderBy', orderBy)

      Object.entries(filterBooleans).forEach(([key, val]) => {
        if (val) query.set(key, 'true')
      })

      const res = await fetch(`/api/profiles/search?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error("Error loading profiles:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/user/settings')
        if (res.ok) {
          const data = await res.json()
          setDiscreetMode(data.discreetMode)
        }
      } catch (err) {
        console.error("Error reading settings:", err)
      }
    }

    loadSettings()
    fetchProfiles()
    fetchHotlists()
  }, [])

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProfiles()
  }

  const handleResetFilters = () => {
    setNickname('')
    setGender('')
    setMinAge('')
    setMaxAge('')
    setTown('')
    setOrderBy('lastUpdated-desc')
    setFilterBooleans({
      verified: false,
      availableTodayEscort: false,
      hasGallery: false,
      hasPrivateGallery: false,
    })
    setTimeout(() => {
      fetchProfiles()
    }, 50)
  }

  const toggleBooleanFilter = (key: string) => {
    setFilterBooleans(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Advanced Profile Search</h2>
          <p className="text-xs text-slate-500">Query and filter the cached local profile directory seamlessly.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Filter className="h-3.5 w-3.5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={fetchProfiles}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Directory
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {showFilters && (
          <form
            onSubmit={handleApplyFilters}
            className="w-80 bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm flex-shrink-0"
          >
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-800">Advanced Filter Engine</h3>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Nickname Keyword</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
              >
                <option value="">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Trans">Trans / TV / TS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Age Limits</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="w-1/2 text-xs border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="w-1/2 text-xs border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Town Location</label>
              <input
                type="text"
                placeholder="e.g. Mayfair"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Ordering</label>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
              >
                <option value="lastUpdated-desc">Last Updated (Newest)</option>
                <option value="views-desc">Views Count (Popular)</option>
                <option value="age-asc">Age (Youngest)</option>
                <option value="age-desc">Age (Oldest)</option>
                <option value="nickname-asc">Nickname (A-Z)</option>
                <option value="nickname-desc">Nickname (Z-A)</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Availability & Status</span>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
                {[
                  { key: 'verified', label: 'Fully Verified Member' },
                  { key: 'availableTodayEscort', label: 'Available Today (Escort)' },
                  { key: 'hasGallery', label: 'Has Gallery' },
                  { key: 'hasPrivateGallery', label: 'Has Private Gallery' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-indigo-600">
                    <input
                      type="checkbox"
                      checked={filterBooleans[item.key]}
                      onChange={() => toggleBooleanFilter(item.key)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2 h-3.5 w-3.5"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/2 text-center text-xs border border-slate-300 rounded py-1.5 hover:bg-slate-50 text-slate-600 font-semibold"
              >
                Clear All
              </button>
              <button
                type="submit"
                className="w-1/2 text-center text-xs bg-indigo-600 text-white rounded py-1.5 hover:bg-indigo-700 font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-slate-500 font-semibold">Querying local directories...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <div>
                <p className="font-bold text-slate-800">No Profiles Cached</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting your filter variables or trigger a fresh synchronization in the Admin section.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[10px]">
                    <th className="py-3 px-4 font-bold">Member ID</th>
                    <th className="py-3 px-4 font-bold">Nickname</th>
                    <th className="py-3 px-4 font-bold">Age / Gender</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold">Services & Verification</th>
                    <th className="py-3 px-4 font-bold">Views</th>
                    <th className="py-3 px-4 font-bold">Ratings (Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((profile) => (
                    <tr
                      key={profile.userId}
                      onClick={() => setSelectedProfile(profile)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        #{profile.userId}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        {profile.nickname}
                        {profile.verified && (
                          <span title="Verified Member">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {profile.age || 'N/A'} yrs / {profile.gender || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {profile.town ? `${profile.town}, ` : ''}{profile.region || 'UK'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.isEscort && (
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-emerald-200">Escort</span>
                          )}
                          {profile.isWebcam && (
                            <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-indigo-200">Webcam</span>
                          )}
                          {profile.isPhoneChat && (
                            <span className="bg-sky-50 text-sky-700 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-sky-200">Phone</span>
                          )}
                          {profile.isSMSChat && (
                            <span className="bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-purple-200">SMS</span>
                          )}
                          {profile.isAlternative && (
                            <span className="bg-amber-50 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-amber-200">Alt</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {profile.views?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{profile.ratingTotal}</span> ratings
                        {profile.ratingTotal > 0 && (
                          <span className="text-[10px] text-emerald-600 ml-1">
                            ({Math.round((profile.ratingPositive / profile.ratingTotal) * 100)}% +)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Profile dossier</span>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {selectedProfile.nickname}
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                    UserID: #{selectedProfile.userId}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex gap-5 items-start">
                {!discreetMode && (selectedProfile.squareUrl || selectedProfile.thumbnailUrl) ? (
                  <div className="h-24 w-24 rounded border border-slate-200 bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={selectedProfile.squareUrl || selectedProfile.thumbnailUrl || ''}
                      alt={selectedProfile.nickname}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl uppercase flex-shrink-0 shadow-inner">
                    {selectedProfile.nickname.substring(0, 2)}
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-500 uppercase text-[10px]">Gender:</span>{' '}
                      <span className="font-medium text-slate-800">{selectedProfile.gender || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 uppercase text-[10px]">Age:</span>{' '}
                      <span className="font-medium text-slate-800">{selectedProfile.age || 'N/A'} yrs</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 uppercase text-[10px]">Orientation:</span>{' '}
                      <span className="font-medium text-slate-800">{selectedProfile.orientation || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 uppercase text-[10px]">Nationality:</span>{' '}
                      <span className="font-medium text-slate-800">{selectedProfile.nationality || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-xs border-t border-slate-100 pt-2 text-slate-700 italic">
                    "{selectedProfile.summary || 'No summary bio provided.'}"
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded p-4 space-y-2 bg-slate-50">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hotlist Assignments</h4>
                {loadingHotlists ? (
                  <p className="text-[11px] text-slate-400">Loading your hotlists...</p>
                ) : hotlists.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No hotlists found. Create hotlists in the Hotlists section.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hotlists.map((list) => {
                      const isMember = list.HotListMembers?.some((m: any) => m.UserID === selectedProfile.userId)
                      return (
                        <button
                          key={list.HotListDetails.ListID}
                          onClick={() => handleToggleHotlist(list.HotListDetails.ListID, isMember)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition flex items-center gap-1 ${
                            isMember
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className={isMember ? 'text-rose-500' : 'text-slate-400'}>♥</span>
                          {list.HotListDetails.ListName}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded p-4 bg-slate-50 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Geographic deployment</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Country</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.country || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Region / County</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.region || selectedProfile.county || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] block">Town / District</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.town || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Services enabled</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {[
                      { val: selectedProfile.isEscort, label: 'Escort Services' },
                      { val: selectedProfile.isWebcam, label: 'Webcam Show' },
                      { val: selectedProfile.isPhoneChat, label: 'Phone Chat' },
                      { val: selectedProfile.isSMSChat, label: 'SMS Chat' },
                      { val: selectedProfile.isAlternative, label: 'Alternative practices' },
                      { val: selectedProfile.isOtherServices, label: 'Other custom services' },
                    ].map((svc) => (
                      <div key={svc.label} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${svc.val ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={svc.val ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>{svc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Availability & verification</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {[
                      { val: selectedProfile.verified, label: 'Fully Verified Member' },
                      { val: selectedProfile.availableTodayEscort, label: 'Available Today (Escort)' },
                      { val: selectedProfile.availableNowWebcam, label: 'Available Now (Webcam)' },
                      { val: selectedProfile.availableNowPhoneChat, label: 'Available Now (Phone)' },
                      { val: selectedProfile.hasGallery, label: 'Has Free Gallery' },
                      { val: selectedProfile.hasPrivateGallery, label: 'Has Private Gallery' },
                    ].map((svc) => (
                      <div key={svc.label} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${svc.val ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                        <span className={svc.val ? 'text-slate-800 font-medium' : 'text-slate-400'}>{svc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Feedback rating audit</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded">
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">Positive</span>
                      <span className="text-sm font-extrabold">{selectedProfile.ratingPositive}</span>
                    </div>
                    <div className="bg-red-50 text-red-800 p-2 rounded">
                      <span className="block text-[10px] text-red-600 font-bold uppercase">Negative</span>
                      <span className="text-sm font-extrabold">{selectedProfile.ratingNegative}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Total Ratings: <strong>{selectedProfile.ratingTotal}</strong> (Neutral: {selectedProfile.ratingNeutral})
                  </div>
                </div>

                <div className="border border-slate-200 rounded p-4 bg-slate-50 flex flex-col justify-between">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">System metadata</h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-500">Member since:</span>{' '}
                      {selectedProfile.memberSince ? new Date(selectedProfile.memberSince).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Last login:</span>{' '}
                      {selectedProfile.lastLoggedIn ? new Date(selectedProfile.lastLoggedIn).toLocaleString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Last updated:</span>{' '}
                      {selectedProfile.lastUpdated ? new Date(selectedProfile.lastUpdated).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <a
                href={`/dashboard/messages?participant=${selectedProfile.userId}`}
                className="inline-flex items-center justify-center bg-indigo-600 text-white rounded px-4 py-2 text-xs font-bold hover:bg-indigo-700 transition"
              >
                Initiate Chat
              </a>
              {selectedProfile.profileUrl && (
                <a
                  href={selectedProfile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  View original profile ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
