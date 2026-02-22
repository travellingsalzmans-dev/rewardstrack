'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

type Card = {
  id: string
  card_name: string
  bank_name: string
  annual_fee: number
  points_program: string | null
  status: string
  date_opened: string
  welcome_bonus_points: number | null
  welcome_bonus_deadline: string | null
}

type PointsBalance = {
  id: string
  balance: number | null
  points_value: number | null
}

type SortKey = 'card_name' | 'annual_fee' | 'renewal_date' | 'welcome_bonus_points' | 'welcome_bonus_deadline'
type SortDir = 'asc' | 'desc'

function getRenewalDate(dateOpened: string): string {
  const d = new Date(dateOpened)
  const today = new Date()
  while (d <= today) {
    d.setFullYear(d.getFullYear() + 1)
  }
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
  const [points, setPoints] = useState<PointsBalance[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('card_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)

      const [cardsRes, pointsRes] = await Promise.all([
        supabase.from('credit_cards').select('*').eq('status', 'active'),
        supabase.from('points_balances').select('*'),
      ])

      setCards(cardsRes.data ?? [])
      setPoints(pointsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalPoints = points.reduce((sum, p) => sum + (p.balance ?? 0), 0)
  const estimatedValue = points.reduce((sum, p) => sum + (p.balance ?? 0) * (p.points_value ?? 0.01), 0)
  const activeCards = cards.length

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC'
  }

  const filteredAndSorted = useMemo(() => {
    let result = cards
    if (filter) {
      const lower = filter.toLowerCase()
      result = result.filter(c =>
        c.card_name.toLowerCase().includes(lower) ||
        c.bank_name.toLowerCase().includes(lower)
      )
    }
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'card_name':
          cmp = a.card_name.localeCompare(b.card_name)
          break
        case 'annual_fee':
          cmp = a.annual_fee - b.annual_fee
          break
        case 'renewal_date':
          cmp = getRenewalDate(a.date_opened).localeCompare(getRenewalDate(b.date_opened))
          break
        case 'welcome_bonus_points':
          cmp = (a.welcome_bonus_points ?? -1) - (b.welcome_bonus_points ?? -1)
          break
        case 'welcome_bonus_deadline':
          cmp = (a.welcome_bonus_deadline ?? '').localeCompare(b.welcome_bonus_deadline ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [cards, filter, sortKey, sortDir])

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
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              PointMaxer
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/cards" className="text-sm text-gray-600 hover:text-gray-900">Cards</Link>
              <Link href="/points" className="text-sm text-gray-600 hover:text-gray-900">Points</Link>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mb-8">Here&apos;s your rewards overview.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Total Points</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Across {points.length} program{points.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Active Cards</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{activeCards}</p>
            <p className="text-sm text-gray-400 mt-1">Card{activeCards !== 1 ? 's' : ''} tracked</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500">Estimated Value</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">${estimatedValue.toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">Based on current rates</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/cards" className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">Add a credit card</span>
              <span className="text-gray-400">&rarr;</span>
            </Link>
            <Link href="/points" className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">Log points balance</span>
              <span className="text-gray-400">&rarr;</span>
            </Link>
            <Link href="/recommendations" className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">View spending recommendations</span>
              <span className="text-gray-400">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Cards</h2>
            <input
              type="text"
              placeholder="Filter by card name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-400">No cards yet</p>
              <p className="text-sm text-gray-400 mt-1">Add a card to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      onClick={() => handleSort('card_name')}
                      className="text-left py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    >
                      Card Name{sortIndicator('card_name')}
                    </th>
                    <th
                      onClick={() => handleSort('annual_fee')}
                      className="text-right py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    >
                      Annual Fee{sortIndicator('annual_fee')}
                    </th>
                    <th
                      onClick={() => handleSort('renewal_date')}
                      className="text-left py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    >
                      Next Renewal{sortIndicator('renewal_date')}
                    </th>
                    <th
                      onClick={() => handleSort('welcome_bonus_points')}
                      className="text-right py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    >
                      Bonus Points{sortIndicator('welcome_bonus_points')}
                    </th>
                    <th
                      onClick={() => handleSort('welcome_bonus_deadline')}
                      className="text-left py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    >
                      Bonus Deadline{sortIndicator('welcome_bonus_deadline')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map(card => (
                    <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-900">{card.card_name}</p>
                        <p className="text-xs text-gray-400">{card.bank_name}</p>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700">${card.annual_fee}</td>
                      <td className="py-3 px-3 text-gray-700">{formatDate(getRenewalDate(card.date_opened))}</td>
                      <td className="py-3 px-3 text-right text-gray-700">
                        {card.welcome_bonus_points != null ? card.welcome_bonus_points.toLocaleString() : '\u2014'}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {card.welcome_bonus_deadline ? formatDate(card.welcome_bonus_deadline) : '\u2014'}
                      </td>
                    </tr>
                  ))}
                  {filteredAndSorted.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        No cards match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
