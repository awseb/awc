'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/dashboard/profiles')
        router.refresh()
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.')
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow">
              AW
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Enterprise Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Authorized Personnel Only
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                User ID / Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or 10101"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Security Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-md">
            <span>
              <strong>Admin:</strong> admin / adminpassword
            </span>
            <span>
              <strong>User ID:</strong> 10101 / password
            </span>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {loading ? 'Authenticating...' : 'Secure Log In'}
            </button>
          </div>
        </form>

        <div className="mt-4 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-400">
            This workspace complies with standard enterprise communication security policies. Action logs are audited automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
