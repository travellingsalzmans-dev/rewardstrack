'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PointsBalance = {
  id: string
  program_name: string
  balance: number
  points_value: number
  expiration_date: string | null
  last_updated: string
}

export default function PointsPage() {
  const supabase = createClient()
  const [balances, setBalances] = useState<PointsBalance[]>([])
  const [showForm, setShowForm] = useState(false)
  const [programName, setProgramName] = useState('')
  const [balance, setBalance] = useState('')
  const [pointsValue, setPointsValue] = useState('0.01')
  const [expirationDate, setExpirationDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('points_balances')
        .select('*')
        .order('program_name')
      if (data) setBalances(data)
      setLoading(false)
    }
    load()
  }, [])

  const resetForm = () => {
    setProgramName('')
    setBalance('')
    setPointsValue('0.01')
    setExpirationDate('')
    setEditingId(null)
    setError('')
    setShowForm(false)
  }

  const startEdit = (p: PointsBalance) => {
    setProgramName(p.program_name)
    setBalance(String(p.balance))
    setPointsValue(String(p.points_value))
    setExpirationDate(p.expiration_date ?? '')
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }

    const row = {
      user_id: user.id,
      program_name: programName,
      balance: Number(balance) || 0,
      points_value: Number(pointsValue) || 0.01,
      expiration_date: expirationDate || null,
      last_updated: new Date().toISOString(),
    }

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from('points_balances')
        .update(row)
        .eq('id', editingId)
        .select()
        .single()

      if (updateError) { setError(updateError.message); setSaving(false); return }
      setBalances(balances.map(b => b.id === editingId ? data : b))
    } else {
      const { data, error: insertError } = await supabase
        .from('points_balances')
        .insert(row)
        .select()
        .single()

      if (insertError) { setError(insertError.message); setSaving(false); return }
      setBalances([...balances, data].sort((a, b) => a.program_name.localeCompare(b.program_name)))
    }

    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('points_balances').delete().eq('id', id)
    if (!error) setBalances(balances.filter(b => b.id !== id))
  }

  const totalPoints = balances.reduce((sum, b) => sum + b.balance, 0)
  const totalValue = balances.reduce((sum, b) => sum + b.balance * b.points_value, 0)

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
              <Link href="/points" className="text-sm font-semibold text-gray-900">Points</Link>
              <Link href="/recommendations" className="text-sm text-gray-600 hover:text-gray-900">Recommendations</Link>
              <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Points Balances</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Program
          </button>
        </div>

        {balances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Total Points</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Total Estimated Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Update balance' : 'Add a rewards program'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input
                  type="text" value={programName} onChange={(e) => setProgramName(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Aeroplan, Scene+, MR Points"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number" value={balance} onChange={(e) => setBalance(e.target.value)} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0" min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value per point ($)</label>
                  <input
                    type="number" value={pointsValue} onChange={(e) => setPointsValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.01" min="0" step="0.001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit" disabled={saving}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button" onClick={resetForm}
                  className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {balances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400">No points programs tracked yet</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Add Program&quot; to start logging your balances.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map(b => (
              <div key={b.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.program_name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    <span>{b.balance.toLocaleString()} pts</span>
                    <span>${(b.balance * b.points_value).toFixed(2)} value</span>
                    <span>${b.points_value}/pt</span>
                    {b.expiration_date && <span>Expires {b.expiration_date}</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(b)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-sm text-gray-400 hover:text-red-500">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
