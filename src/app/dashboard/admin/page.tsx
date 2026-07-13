'use client'

import React, { useState, useEffect } from 'react'
import { Settings, RefreshCw, Clock, History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface SyncConfig {
  id: number
  interval: string
  lastSyncedAt: string | null
  syncInProgress: boolean
}

interface SyncLog {
  id: number
  startedAt: string
  completedAt: string | null
  status: string
  profilesSynced: number
  errorMessage: string | null
}

export default function SyncSettingsAdmin() {
  const [config, setConfig] = useState<SyncConfig | null>(null)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [interval, setIntervalVal] = useState('manual')
  const [triggering, setTriggering] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettingsAndLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sync/config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        setLogs(data.logs || [])
        if (data.config) {
          setIntervalVal(data.config.interval)
        }
      } else {
        setError("Failed to fetch Admin synchronization credentials.")
      }
    } catch (err) {
      setError("Network error fetching admin state.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettingsAndLogs()
  }, [])

  const handleUpdateInterval = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      if (res.ok) {
        alert("Scheduler frequency successfully updated!")
        loadSettingsAndLogs()
      } else {
        alert("Failed to change schedule frequency.")
      }
    } catch (err) {
      alert("Network failure saving scheduler variables.")
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerSync = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`Synchronization finished. Successfully updated ${data.profilesSynced} profiles!`)
        loadSettingsAndLogs()
      } else {
        const data = await res.json()
        alert(`Sync failed: ${data.error || 'Server error'}`)
        loadSettingsAndLogs()
      }
    } catch (err) {
      alert("Failed to start sync process.")
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-sm text-slate-500 font-semibold font-mono">Loading Administration Portal...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          Sync Control & Administration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure cache synchronization schedules and audit logs linking with AdultWork API directory databases.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="text-xs font-semibold text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-slate-800">
            <Clock className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-sm">Cron Synchronization Interval</h3>
          </div>

          <form onSubmit={handleUpdateInterval} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sync Frequency</label>
              <select
                value={interval}
                onChange={(e) => setIntervalVal(e.target.value)}
                disabled={saving}
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-2 focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
              >
                <option value="manual">Manual Trigger Only (No automated cron)</option>
                <option value="hourly">Hourly Checks</option>
                <option value="daily">Daily Sync (Every 24 hours)</option>
                <option value="twicedaily">Bi-Daily Sync (Every 12 hours)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full text-center text-xs bg-slate-900 text-white rounded py-2 hover:bg-slate-800 font-semibold transition disabled:bg-slate-300"
            >
              {saving ? 'Saving changes...' : 'Save Schedule Settings'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Manual Force Sync</span>
            <p className="text-[11px] text-slate-500">
              Query the AdultWork API now and append/upsert the latest profile records into your local PostgreSQL cache.
            </p>
            <button
              onClick={handleTriggerSync}
              disabled={triggering || config?.syncInProgress}
              className="w-full text-center text-xs bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 font-bold transition flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${triggering ? 'animate-spin' : ''}`} />
              {triggering || config?.syncInProgress ? 'Synchronizing now...' : 'Start Manual Sync'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm">Deployment Cache Metadata</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cron Scheduler Profile:</span>
                <span className="font-bold text-slate-800 uppercase tracking-wide">{config?.interval}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Active Sync Lock:</span>
                <span className={`font-bold ${config?.syncInProgress ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {config?.syncInProgress ? 'LOCKED (RUNNING)' : 'IDLE'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Last Synced Date:</span>
                <span className="font-semibold text-slate-700">
                  {config?.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 text-[11px] text-indigo-800 leading-relaxed">
            <strong>System Guideline:</strong> Scheduled updates run on the main node background thread automatically. Manual synchronization bypasses other queues and completes instantly.
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2 text-slate-800 bg-slate-50">
          <History className="h-4 w-4 text-indigo-600" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Sync Transaction Logs</h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No synchronization transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-500 uppercase text-[9px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">Trigger Timestamp</th>
                  <th className="py-2.5 px-4">Duration / Complete</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Profiles Synced</th>
                  <th className="py-2.5 px-4">Log Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-4 font-mono text-slate-500">#{log.id}</td>
                    <td className="py-2 px-4 text-slate-700 font-medium">{new Date(log.startedAt).toLocaleString()}</td>
                    <td className="py-2 px-4 text-slate-600">
                      {log.completedAt ? new Date(log.completedAt).toLocaleTimeString() : 'Incomplete'}
                    </td>
                    <td className="py-2 px-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </span>
                      ) : log.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <XCircle className="h-3 w-3" /> FAILED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold text-[10px] animate-pulse">
                          <RefreshCw className="h-3 w-3 animate-spin" /> RUNNING
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-800">{log.profilesSynced}</td>
                    <td className="py-2 px-4 text-red-600 italic max-w-xs truncate" title={log.errorMessage || ''}>
                      {log.errorMessage || 'Transaction completed successfully.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
