'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Trash2, Plus, MessageSquare, Eye, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react'

interface HotListDetails {
  UserID: number
  ListID: number
  ListName: string
  UserName: string
}

interface HotListMember {
  UserID: number
  InteractionCount: number
  UserName: string
  Notes: string | null
  LastUpdated: string
  LastInteractionDate: string
}

interface HotList {
  HotListDetails: HotListDetails
  HotListMembers: HotListMember[]
}

export default function HotlistsManagement() {
  const [hotlists, setHotlists] = useState<HotList[]>([])
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected member profile details modal state
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const fetchHotlists = async (autoSelectId?: number | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/hotlists')
      if (res.ok) {
        const data = await res.json()
        const lists = data.hotlists || []
        setHotlists(lists)

        if (autoSelectId) {
          setSelectedListId(autoSelectId)
        } else if (lists.length > 0 && (!selectedListId || !lists.some((l: any) => l.HotListDetails.ListID === selectedListId))) {
          setSelectedListId(lists[0].HotListDetails.ListID)
        }
      } else {
        setError("Failed to fetch hotlists from AdultWork.")
      }
    } catch (err) {
      console.error("Error loading hotlists:", err)
      setError("Network error fetching hotlists.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotlists()
  }, [])

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/hotlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          listName: newListName
        })
      })

      if (res.ok) {
        const data = await res.json()
        setNewListName('')
        await fetchHotlists()
        alert("New hotlist created successfully!")
      } else {
        const data = await res.json()
        alert(`Error creating hotlist: ${data.error || 'Server error'}`)
      }
    } catch (err) {
      console.error(err)
      alert("Network error creating hotlist.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Are you sure you want to delete this hotlist? This cannot be undone.")) return

    try {
      const res = await fetch('/api/hotlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-list',
          listId
        })
      })

      if (res.ok) {
        setSelectedListId(null)
        await fetchHotlists()
        alert("Hotlist removed successfully.")
      } else {
        const data = await res.json()
        alert(`Failed to delete hotlist: ${data.error || 'Server error'}`)
      }
    } catch (err) {
      console.error(err)
      alert("Network error removing hotlist.")
    }
  }

  const handleRemoveMember = async (userId: number, listId: number) => {
    if (!confirm("Remove this member from the hotlist?")) return

    try {
      const res = await fetch('/api/hotlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-user',
          userId,
          listId
        })
      })

      if (res.ok) {
        await fetchHotlists(listId)
      } else {
        const data = await res.json()
        alert(`Failed to remove member: ${data.error || 'Server error'}`)
      }
    } catch (err) {
      console.error(err)
      alert("Network error removing member.")
    }
  }

  const handleViewProfile = async (userId: number) => {
    setLoadingProfile(true)
    try {
      // Find inside local cache database
      const res = await fetch(`/api/profiles/search?nickname=`)
      if (res.ok) {
        const data = await res.json()
        const found = data.profiles?.find((p: any) => p.userId === userId)
        if (found) {
          setSelectedProfile(found)
        } else {
          // If not in cache, present a basic fallback representation
          setSelectedProfile({
            userId,
            nickname: `User #${userId}`,
            summary: "No detailed cached profile available locally. Run manual sync or open in AdultWork.",
            gender: "Unknown",
            age: null,
            orientation: null,
            country: "United Kingdom",
            isEscort: true,
            verified: false
          })
        }
      }
    } catch (err) {
      console.error("Error viewing profile:", err)
    } finally {
      setLoadingProfile(false)
    }
  }

  const activeList = hotlists.find(l => l.HotListDetails.ListID === selectedListId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600 fill-rose-600" />
            My Hotlists Directory
          </h2>
          <p className="text-xs text-slate-500">
            See and manage your custom AdultWork Hotlists and membership assignments smoothly.
          </p>
        </div>
        <button
          onClick={() => fetchHotlists(selectedListId)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition animate-fade-in"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Hotlists
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 p-4 border border-rose-200 flex gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <div className="text-xs font-semibold text-rose-800">{error}</div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Left: Lists directory */}
        <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm flex-shrink-0">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Your Lists</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">
              {hotlists.length} lists
            </span>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {hotlists.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No lists loaded.</p>
            ) : (
              hotlists.map((list) => {
                const isActive = list.HotListDetails.ListID === selectedListId
                return (
                  <button
                    key={list.HotListDetails.ListID}
                    onClick={() => setSelectedListId(list.HotListDetails.ListID)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">{list.HotListDetails.ListName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {list.HotListMembers?.length || 0}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <form onSubmit={handleCreateList} className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Create New List</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                disabled={creating}
                className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={creating || !newListName.trim()}
                className="px-2.5 py-1.5 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition disabled:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Details Panel */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-[400px] flex flex-col justify-between">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3 flex-grow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              <span className="text-sm text-slate-500 font-semibold font-mono">Loading hotlist entries...</span>
            </div>
          ) : !activeList ? (
            <div className="p-12 text-center space-y-4 flex-grow flex flex-col justify-center items-center text-slate-400">
              <Heart className="h-10 w-10 text-slate-300 fill-slate-50" />
              <div>
                <p className="font-bold text-slate-800">No Hotlist Selected</p>
                <p className="text-xs text-slate-500 mt-1">Please select an existing hotlist on the left or create a new one to begin.</p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-md font-bold text-slate-800">
                    {activeList.HotListDetails.ListName}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    List ID: #{activeList.HotListDetails.ListID} &bull; Created by: {activeList.HotListDetails.UserName}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteList(activeList.HotListDetails.ListID)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded font-semibold transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete List
                </button>
              </div>

              {activeList.HotListMembers?.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 flex-grow flex flex-col justify-center items-center">
                  This hotlist is currently empty. Open Advanced Profile Search and click any profile to add them to this list!
                </div>
              ) : (
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[10px] font-bold">
                        <th className="py-3 px-4">Member ID</th>
                        <th className="py-3 px-4">Nickname</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4">Last Updated</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeList.HotListMembers.map((member) => (
                        <tr key={member.UserID} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                            #{member.UserID}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {member.UserName}
                          </td>
                          <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                            {member.Notes || "None"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {member.LastUpdated ? new Date(member.LastUpdated).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => handleViewProfile(member.UserID)}
                              disabled={loadingProfile}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="View Dossier"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <a
                              href={`/dashboard/messages?participant=${member.UserID}`}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Direct Chat"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleRemoveMember(member.UserID, activeList.HotListDetails.ListID)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Remove from List"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <XButton className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex gap-5 items-start">
                <div className="h-24 w-24 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl uppercase flex-shrink-0 shadow-inner">
                  {selectedProfile.nickname.substring(0, 2)}
                </div>

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
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <a
                href={`/dashboard/messages?participant=${selectedProfile.userId}`}
                className="inline-flex items-center justify-center bg-rose-600 text-white rounded px-4 py-2 text-xs font-bold hover:bg-rose-700 transition"
              >
                Initiate Chat
              </a>
              {selectedProfile.profileUrl && (
                <a
                  href={selectedProfile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-rose-600 hover:underline font-bold"
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

function XButton({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
