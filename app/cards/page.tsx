'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Card = {
  id: string
  card_name: string
  bank_name: string
  annual_fee: number
  points_program: string | null
  status: string
  date_opened: string
}

type CardTemplate = {
  id: number
  card_name: string
  issuer: string
  annual_fee: number
  reward_type: string
}

export default function CardsPage() {
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const [annualFee, setAnnualFee] = useState('')
  const [pointsProgram, setPointsProgram] = useState('')
  const [dateOpened, setDateOpened] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [cardsRes, templatesRes] = await Promise.all([
        supabase.from('credit_cards').select('*').order('created_at', { ascending: false }),
        supabase.from('card_templates').select('*').order('issuer'),
      ])
      if (cardsRes.data) setCards(cardsRes.data)
      if (templatesRes.data) setTemplates(templatesRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const resetForm = () => {
    setSelectedTemplate('')
    setCardName('')
    setBankName('')
    setAnnualFee('')
    setPointsProgram('')
    setDateOpened(new Date().toISOString().split('T')[0])
    setError('')
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }

    let name = cardName
    let bank = bankName
    let fee = Number(annualFee) || 0
    let program = pointsProgram || null
    if (useTemplate && selectedTemplate) {
      const t = templates.find(t => String(t.id) === selectedTemplate)
      if (t) {
        name = t.card_name
        bank = t.issuer
        fee = t.annual_fee
        program = t.reward_type
      }
    }

    const { data, error: insertError } = await supabase
      .from('credit_cards')
      .insert({
        user_id: user.id,
        card_name: name,
        bank_name: bank,
        annual_fee: fee,
        points_program: program,
        date_opened: dateOpened,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setCards([data, ...cards])
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id)
    if (!error) setCards(cards.filter(c => c.id !== id))
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
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              PointMaxer
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/cards" className="text-sm font-semibold text-gray-900">Cards</Link>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Card
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a new card</h2>

            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUseTemplate(true)}
                className={`text-sm px-3 py-1 rounded-md ${useTemplate ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Pick from list
              </button>
              <button
                type="button"
                onClick={() => setUseTemplate(false)}
                className={`text-sm px-3 py-1 rounded-md ${!useTemplate ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Enter manually
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {useTemplate ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select a card</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a card...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.issuer} — {t.card_name} (${t.annual_fee}/yr)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Name</label>
                    <input
                      type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Cobalt Card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank / Issuer</label>
                    <input
                      type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. American Express"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fee</label>
                    <input
                      type="number" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0" min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points Program</label>
                    <input
                      type="text" value={pointsProgram} onChange={(e) => setPointsProgram(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Aeroplan, Scene+"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Opened</label>
                <input
                  type="date" value={dateOpened} onChange={(e) => setDateOpened(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit" disabled={saving}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Card'}
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

        {cards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400">No cards added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Add Card&quot; to start tracking your rewards.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(card => (
              <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{card.card_name}</h3>
                    <p className="text-sm text-gray-500">{card.bank_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>${card.annual_fee}/yr</span>
                  {card.points_program && <span>{card.points_program}</span>}
                  <span className="capitalize">{card.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
