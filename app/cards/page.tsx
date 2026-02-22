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
  welcome_bonus_points: number | null
  welcome_bonus_deadline: string | null
  perks: string | null
  credits_included: string | null
}

type CardTemplate = {
  id: number
  card_name: string
  issuer: string
  annual_fee: number
  reward_type: string
  card_type: string | null
  perks: string | null
  credits_included: string | null
}

type CategoryRates = { dining: number; groceries: number; gas: number; travel: number; transit: number; streaming: number; general: number }

const REWARD_RATES: Record<string, CategoryRates> = {
  'Cobalt Card':                      { dining: 5, groceries: 5, gas: 2, travel: 2, transit: 2, streaming: 3, general: 1 },
  'Aeroplan Visa Infinite':           { dining: 1, groceries: 1.5, gas: 1.5, travel: 1.5, transit: 1, streaming: 1, general: 1 },
  'Gold Rewards Card':                { dining: 1, groceries: 2, gas: 2, travel: 2, transit: 1, streaming: 1, general: 1 },
  'Platinum Card':                    { dining: 2, groceries: 1, gas: 1, travel: 2, transit: 1, streaming: 1, general: 1 },
  'Aventura Visa Infinite':           { dining: 1, groceries: 1.5, gas: 1.5, travel: 2, transit: 1, streaming: 1, general: 1 },
  'Scotia Gold American Express':     { dining: 5, groceries: 5, gas: 3, travel: 1, transit: 3, streaming: 3, general: 1 },
  'Eclipse Visa Infinite':            { dining: 5, groceries: 5, gas: 5, travel: 1, transit: 5, streaming: 1, general: 1 },
  'Avion Visa Infinite':              { dining: 1, groceries: 1, gas: 1, travel: 1.25, transit: 1, streaming: 1, general: 1 },
  'Cash Back Visa Infinite':          { dining: 1, groceries: 3, gas: 3, travel: 1, transit: 3, streaming: 3, general: 1 },
  'Dividend Visa Infinite':           { dining: 2, groceries: 4, gas: 4, travel: 1, transit: 2, streaming: 1, general: 1 },
  'Aeroplan Visa Infinite Privilege': { dining: 1.5, groceries: 1.5, gas: 1.5, travel: 1.5, transit: 1.5, streaming: 1.25, general: 1.25 },
  'WestJet RBC World Elite':          { dining: 1.5, groceries: 2, gas: 2, travel: 1.5, transit: 2, streaming: 1.5, general: 1.5 },
  'Scene+ Visa Infinite':             { dining: 2, groceries: 2, gas: 1, travel: 3, transit: 2, streaming: 2, general: 1 },
  'Triangle World Elite Mastercard':  { dining: 1, groceries: 3, gas: 3, travel: 1, transit: 1, streaming: 1, general: 1 },
  'PC Financial World Elite':         { dining: 1, groceries: 3, gas: 3, travel: 1, transit: 1, streaming: 1, general: 1 },
}

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining', groceries: 'Groceries', gas: 'Gas', travel: 'Travel', transit: 'Transit', streaming: 'Streaming',
}

function getRates(cardName: string): CategoryRates {
  if (REWARD_RATES[cardName]) return REWARD_RATES[cardName]
  const lower = cardName.toLowerCase().trim()
  for (const [key, rates] of Object.entries(REWARD_RATES)) {
    const keyLower = key.toLowerCase()
    if (lower.includes(keyLower) || keyLower.includes(lower)) return rates
  }
  return { dining: 1, groceries: 1, gas: 1, travel: 1, transit: 1, streaming: 1, general: 1 }
}

function getHighRateCategories(cardName: string): { category: string; rate: number }[] {
  const rates = getRates(cardName)
  return Object.entries(rates)
    .filter(([key, rate]) => key !== 'general' && rate >= 3)
    .map(([key, rate]) => ({ category: CATEGORY_LABELS[key] || key, rate }))
    .sort((a, b) => b.rate - a.rate)
}

export default function CardsPage() {
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [showForm, setShowForm] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedIssuer, setSelectedIssuer] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [cardName, setCardName] = useState('')
  const [bankName, setBankName] = useState('')
  const [annualFee, setAnnualFee] = useState('')
  const [pointsProgram, setPointsProgram] = useState('')
  const [dateOpened, setDateOpened] = useState(new Date().toISOString().split('T')[0])
  const [welcomeBonusPoints, setWelcomeBonusPoints] = useState('')
  const [welcomeBonusDeadline, setWelcomeBonusDeadline] = useState('')
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

  const issuers = [...new Set(templates.map(t => t.issuer))].sort()
  const filteredTemplates = selectedIssuer
    ? templates.filter(t => t.issuer === selectedIssuer)
    : templates

  const resetForm = () => {
    setSelectedIssuer('')
    setSelectedTemplate('')
    setCardName('')
    setBankName('')
    setAnnualFee('')
    setPointsProgram('')
    setDateOpened(new Date().toISOString().split('T')[0])
    setWelcomeBonusPoints('')
    setWelcomeBonusDeadline('')
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
    let cardPerks: string | null = null
    let cardCredits: string | null = null
    if (useTemplate && selectedTemplate) {
      const t = templates.find(t => String(t.id) === selectedTemplate)
      if (t) {
        name = t.card_name
        bank = t.issuer
        fee = t.annual_fee
        program = t.reward_type
        cardPerks = t.perks
        cardCredits = t.credits_included
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
        welcome_bonus_points: welcomeBonusPoints ? Number(welcomeBonusPoints) : null,
        welcome_bonus_deadline: welcomeBonusDeadline || null,
        perks: cardPerks,
        credits_included: cardCredits,
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
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select issuer (optional)</label>
                    <select
                      value={selectedIssuer}
                      onChange={(e) => { setSelectedIssuer(e.target.value); setSelectedTemplate('') }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All issuers</option>
                      {issuers.map(issuer => (
                        <option key={issuer} value={issuer}>{issuer}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select a card</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a card...</option>
                      {filteredTemplates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.card_name} (${t.annual_fee}/yr){t.card_type === 'Business' ? ' [Business]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus Points (optional)</label>
                <input
                  type="number" value={welcomeBonusPoints} onChange={(e) => setWelcomeBonusPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 50000" min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Bonus Deadline (optional)</label>
                <input
                  type="date" value={welcomeBonusDeadline} onChange={(e) => setWelcomeBonusDeadline(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded">${card.annual_fee}/yr</span>
                  {card.points_program && card.points_program !== 'None' && (
                    <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{card.points_program}</span>
                  )}
                  <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded capitalize">{card.status}</span>
                </div>
                {(card.perks || getHighRateCategories(card.card_name).length > 0) && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Perks</p>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {getHighRateCategories(card.card_name).map(({ category, rate }) => (
                        <li key={category} className="flex items-start gap-1.5">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-purple-400" />
                          <span><span className="font-medium text-purple-700">{rate}x</span> {category}</span>
                        </li>
                      ))}
                      {card.perks && card.perks.split(';').map((perk, i) => perk.trim() && (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-blue-400" />
                          <span>{perk.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {card.credits_included && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Credits</p>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {card.credits_included.split(';').map((credit, i) => credit.trim() && (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-green-400 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-green-400" />
                          <span>{credit.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(card.welcome_bonus_points || card.welcome_bonus_deadline) && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Welcome Bonus</p>
                    <div className="flex gap-3 text-sm text-gray-600">
                      {card.welcome_bonus_points && <span>{card.welcome_bonus_points.toLocaleString()} pts</span>}
                      {card.welcome_bonus_deadline && <span>by {card.welcome_bonus_deadline}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
