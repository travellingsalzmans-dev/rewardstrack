import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [cardsRes, pointsRes] = await Promise.all([
    supabase.from('credit_cards').select('*').eq('status', 'active'),
    supabase.from('points_balances').select('*'),
  ])

  const cards = cardsRes.data ?? []
  const points = pointsRes.data ?? []

  const totalPoints = points.reduce((sum, p) => sum + (p.balance ?? 0), 0)
  const estimatedValue = points.reduce((sum, p) => sum + (p.balance ?? 0) * (p.points_value ?? 0.01), 0)
  const activeCards = cards.length

  const recentCards = cards.slice(0, 3)

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
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Cards</h2>
            {recentCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-gray-400">No cards yet</p>
                <p className="text-sm text-gray-400 mt-1">Add a card to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCards.map((card: { id: string; card_name: string; bank_name: string; annual_fee: number; points_program: string | null }) => (
                  <div key={card.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{card.card_name}</p>
                      <p className="text-xs text-gray-400">{card.bank_name}{card.points_program ? ` — ${card.points_program}` : ''}</p>
                    </div>
                    <span className="text-xs text-gray-400">${card.annual_fee}/yr</span>
                  </div>
                ))}
                {cards.length > 3 && (
                  <Link href="/cards" className="block text-center text-sm text-blue-600 hover:underline pt-1">
                    View all {cards.length} cards
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
