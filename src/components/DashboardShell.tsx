'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Mail, Settings, LogOut, Shield, CheckCircle, ToggleLeft, ToggleRight, Heart } from 'lucide-react'

interface SessionData {
  userId: number | null
  username: string
  role: string
  adultworkUserId: number | null
  adultworkNickname: string | null
  discreetMode: boolean
}

interface DashboardShellProps {
  children: React.ReactNode
  initialSession: SessionData
}

export default function DashboardShell({ children, initialSession }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [session] = useState<SessionData>(initialSession)
  const [discreetMode, setDiscreetMode] = useState<boolean>(initialSession.discreetMode)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [updatingDiscreet, setUpdatingDiscreet] = useState(false)

  useEffect(() => {
    document.cookie = `awc_discreet_mode=${discreetMode}; path=/; max-age=31536000`
  }, [discreetMode])

  const handleToggleDiscreetMode = async () => {
    setUpdatingDiscreet(true)
    try {
      const nextVal = !discreetMode
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discreetMode: nextVal })
      })
      if (res.ok) {
        setDiscreetMode(nextVal)
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to update discreet mode:", err)
    } finally {
      setUpdatingDiscreet(false)
    }
  }

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (res.ok) {
      router.push('/login')
      router.refresh()
    }
  }

  const navItems = [
    { name: 'Search Profiles', href: '/dashboard/profiles', icon: Search },
    { name: 'Direct Messaging', href: '/dashboard/messages', icon: Mail },
    { name: 'Hotlists Directory', href: '/dashboard/hotlists', icon: Heart },
  ]

  if (session.role === 'ADMIN') {
    navItems.push({ name: 'Sync Settings', href: '/dashboard/admin', icon: Settings })
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-800 text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-700 bg-slate-900 gap-3">
            <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              AWC
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">AWC SYSTEMS</h1>
              <p className="text-[10px] text-slate-400">Enterprise Workspace</p>
            </div>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-500" /> Secure Node
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" /> Active
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800 text-left"
            >
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-white truncate">
                  {session.username}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {session.role}
                </p>
              </div>
              <Settings className="h-4 w-4 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-white text-slate-800 rounded shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">Discreet Mode</p>
                    <p className="text-[10px] text-slate-400">Omit adult images/logos</p>
                  </div>
                  <button
                    onClick={handleToggleDiscreetMode}
                    disabled={updatingDiscreet}
                    className="text-slate-600 hover:text-indigo-600 focus:outline-none"
                    title={discreetMode ? "Discreet Mode is On" : "Discreet Mode is Off"}
                  >
                    {discreetMode ? (
                      <ToggleRight className="h-6 w-6 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-400" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded">
              Mock Environment
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded">
              AdultWork Connected
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Discreet Filtering:</span>{' '}
              <span className={`text-xs font-semibold ${discreetMode ? 'text-indigo-600' : 'text-amber-600'}`}>
                {discreetMode ? 'ACTIVE (No images/logos)' : 'DEACTIVATED'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
