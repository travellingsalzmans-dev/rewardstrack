'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Preferences = {
  notify_bonus_deadline: boolean
  notify_fee_renewal: boolean
  notify_points_expiry: boolean
}

const DEFAULT_PREFS: Preferences = {
  notify_bonus_deadline: true,
  notify_fee_renewal: true,
  notify_points_expiry: true,
}

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Preferences
  const [prefs, setPrefs] = useState<Preferences>({ ...DEFAULT_PREFS })
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setEmail(user.email ?? '')
      setCreatedAt(user.created_at ? new Date(user.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '')

      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('notify_bonus_deadline, notify_fee_renewal, notify_points_expiry')
        .eq('user_id', user.id)
        .single()

      if (prefsData) {
        setPrefs(prefsData)
      }
      setPrefsLoaded(true)
      setLoading(false)
    }
    load()
  }, [])

  async function handleTogglePref(key: keyof Preferences) {
    setPrefsSaving(true)
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPrefsSaving(false); return }

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updated,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      setPrefs({ ...prefs }) // revert
    }
    setPrefsSaving(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDeleting(false); return }

    // Delete user data from all tables
    await Promise.all([
      supabase.from('credit_cards').delete().eq('user_id', user.id),
      supabase.from('points_balances').delete().eq('user_id', user.id),
      supabase.from('user_preferences').delete().eq('user_id', user.id),
    ])

    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">PointMaxer</Link>
            <div className="flex items-center gap-6">
              <Link href="/cards" className="text-sm text-gray-600 hover:text-gray-900">Cards</Link>
              <Link href="/points" className="text-sm text-gray-600 hover:text-gray-900">Points</Link>
              <Link href="/recommendations" className="text-sm text-gray-600 hover:text-gray-900">Recommendations</Link>
              <Link href="/settings" className="text-sm font-semibold text-gray-900">Settings</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 mb-8">Manage your account and preferences</p>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{email}</p>
            </div>
            {createdAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Member since</p>
                <p className="text-sm text-gray-900">{createdAt}</p>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

          {passwordError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{passwordSuccess}</div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mb-4">Choose which reminders you want to receive</p>

          {prefsLoaded && (
            <div className="space-y-4">
              <ToggleRow
                label="Welcome bonus deadline reminders"
                description="Get reminded when a welcome bonus deadline is approaching"
                checked={prefs.notify_bonus_deadline}
                disabled={prefsSaving}
                onChange={() => handleTogglePref('notify_bonus_deadline')}
              />
              <ToggleRow
                label="Annual fee renewal alerts"
                description="Get notified before your card anniversary and fee renewal"
                checked={prefs.notify_fee_renewal}
                disabled={prefsSaving}
                onChange={() => handleTogglePref('notify_fee_renewal')}
              />
              <ToggleRow
                label="Points expiry warnings"
                description="Get alerted when your points are about to expire"
                checked={prefs.notify_points_expiry}
                disabled={prefsSaving}
                onChange={() => handleTogglePref('notify_points_expiry')}
              />
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="bg-white text-red-600 text-sm px-4 py-2 rounded-md border border-red-300 hover:bg-red-50"
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">
                Are you sure? This will delete all your cards, points balances, and preferences. You will be signed out.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ToggleRow({ label, description, checked, disabled, onChange }: {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
