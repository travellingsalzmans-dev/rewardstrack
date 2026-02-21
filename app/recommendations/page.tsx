'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Card = {
  id: string
  card_name: string
  bank_name: string
  status: string
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
  has_no_fx_fee: boolean
}

type CategoryRates = {
  dining: number
  groceries: number
  gas: number
  travel: number
  transit: number
  streaming: number
  general: number
}

type QuizAnswers = {
  dining: number
  groceries: number
  gas: number
  transit: number
  streaming: number
  travel: number
  foreignCurrency: number
  costco: number
  bigPurchase: number
  bigPurchaseTimeline: number
  feeTolerance: number
}

type QuizResult = {
  card_name: string
  issuer: string
  annual_fee: number
  reward_type: string
  score: number             // annual dollar value of rewards (primary ranking metric)
  annualPoints: number      // raw points earned per year
  centsPerPoint: number     // cpp for this card's reward program
  netAnnualValue: number    // score minus annual fee
  firstYearValue: number    // netAnnualValue + welcome bonus value
  welcomeBonusPoints: number
  welcomeBonusValue: number
  fxSavings: number
  matchReason: string
  matchPercent: number
  perks: string | null
  credits_included: string | null
  isAmex: boolean
  valueBreakdown: { category: string; value: number; points: number }[]
}

type QuizResultSet = {
  top: QuizResult[]
  nonAmexPick: QuizResult | null
  welcomeBonus: QuizResult[]
}

const CATEGORIES: { key: keyof CategoryRates; label: string; icon: string }[] = [
  { key: 'dining', label: 'Dining', icon: '🍽️' },
  { key: 'groceries', label: 'Groceries', icon: '🛒' },
  { key: 'gas', label: 'Gas', icon: '⛽' },
  { key: 'travel', label: 'Travel', icon: '✈️' },
  { key: 'transit', label: 'Transit', icon: '🚇' },
  { key: 'streaming', label: 'Streaming', icon: '📺' },
  { key: 'general', label: 'General', icon: '💳' },
]

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

const DEFAULT_RATES: CategoryRates = { dining: 1, groceries: 1, gas: 1, travel: 1, transit: 1, streaming: 1, general: 1 }

function getRates(cardName: string): CategoryRates {
  // Exact match first
  if (REWARD_RATES[cardName]) return REWARD_RATES[cardName]

  // Case-insensitive / substring match
  const lower = cardName.toLowerCase().trim()
  for (const [key, rates] of Object.entries(REWARD_RATES)) {
    const keyLower = key.toLowerCase()
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return rates
    }
  }

  return DEFAULT_RATES
}

function getBestCards(cards: Card[]) {
  return CATEGORIES.map(({ key, label, icon }) => {
    let bestCard: Card | null = null
    let bestRate = 0

    for (const card of cards) {
      const rate = getRates(card.card_name)[key]
      if (rate > bestRate) {
        bestRate = rate
        bestCard = card
      }
    }

    return { key, label, icon, bestCard, bestRate }
  })
}

// --- Quiz definitions ---

type QuizQuestion = {
  key: keyof QuizAnswers
  question: string
  options: { label: string; value: number }[]
  skipIf?: (answers: QuizAnswers) => boolean
}

const QUESTIONS: QuizQuestion[] = [
  {
    key: 'dining',
    question: 'How much do you spend at restaurants per month?',
    options: [
      { label: '$0 – $50', value: 25 },
      { label: '$50 – $150', value: 100 },
      { label: '$150 – $300', value: 225 },
      { label: '$300+', value: 450 },
    ],
  },
  {
    key: 'groceries',
    question: 'How much do you spend on groceries per month?',
    options: [
      { label: '$0 – $100', value: 50 },
      { label: '$100 – $300', value: 200 },
      { label: '$300 – $600', value: 450 },
      { label: '$600+', value: 800 },
    ],
  },
  {
    key: 'gas',
    question: 'How much do you spend on gas/fuel per month?',
    options: [
      { label: '$0', value: 0 },
      { label: '$1 – $100', value: 50 },
      { label: '$100 – $250', value: 175 },
      { label: '$250+', value: 350 },
    ],
  },
  {
    key: 'transit',
    question: 'How much on public transit, Uber, ride-shares per month?',
    options: [
      { label: '$0', value: 0 },
      { label: '$1 – $50', value: 25 },
      { label: '$50 – $150', value: 100 },
      { label: '$150+', value: 225 },
    ],
  },
  {
    key: 'streaming',
    question: 'How much on streaming services (Netflix, Spotify, etc.) per month?',
    options: [
      { label: '$0', value: 0 },
      { label: '$1 – $25', value: 13 },
      { label: '$25 – $50', value: 38 },
      { label: '$50+', value: 70 },
    ],
  },
  {
    key: 'travel',
    question: 'How often do you book flights or hotels?',
    options: [
      { label: 'Rarely', value: 0 },
      { label: '1–2 trips/year', value: 150 },
      { label: '3–5 trips/year', value: 400 },
      { label: '6+ trips/year', value: 750 },
    ],
  },
  {
    key: 'foreignCurrency',
    question: 'How much do you spend in foreign currencies per year (USD purchases, travel abroad, etc.)?',
    options: [
      { label: '$0', value: 0 },
      { label: '$1 – $500', value: 250 },
      { label: '$500 – $2,000', value: 1250 },
      { label: '$2,000+', value: 3500 },
    ],
  },
  {
    key: 'costco',
    question: 'Do you regularly shop at Costco or stores that don\'t accept American Express?',
    options: [
      { label: 'Yes, frequently', value: 2 },
      { label: 'Occasionally', value: 1 },
      { label: 'No', value: 0 },
    ],
  },
  {
    key: 'bigPurchase',
    question: 'Do you have any large purchases planned ($1,000+)?',
    options: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
  },
  {
    key: 'bigPurchaseTimeline',
    question: 'When is your big purchase planned?',
    skipIf: (a) => a.bigPurchase === 0,
    options: [
      { label: 'Next 2 months', value: 2 },
      { label: '2–4 months', value: 3 },
      { label: '4–6 months', value: 5 },
      { label: '6–12 months', value: 9 },
    ],
  },
  {
    key: 'feeTolerance',
    question: 'What\'s the most you\'d pay in annual card fees?',
    options: [
      { label: '$0 — no annual fee', value: 0 },
      { label: 'Up to $120', value: 120 },
      { label: 'Up to $200', value: 200 },
      { label: 'Any amount', value: 9999 },
    ],
  },
]

const DEFAULT_ANSWERS: QuizAnswers = {
  dining: -1,
  groceries: -1,
  gas: -1,
  transit: -1,
  streaming: -1,
  travel: -1,
  foreignCurrency: -1,
  costco: -1,
  bigPurchase: -1,
  bigPurchaseTimeline: -1,
  feeTolerance: -1,
}

// Cents per point (cpp) for each reward program.
// Used to convert raw points into dollar value so cards are ranked by real value.
const POINT_VALUES: Record<string, number> = {
  'Cash Back': 1.0,
  'Cash Back Dollars': 1.0,
  'Membership Rewards': 1.5,
  'Aeroplan Points': 1.8,
  'Scene+ Points': 1.0,
  'Scène+ Points': 1.0,
  'Aventura Points': 1.0,
  'TD Rewards Points': 0.7,
  'Avion Points': 1.2,
  'BMO Points': 0.7,
  'Rewards (BMO Points)': 0.7,
  'WestJet Dollars': 1.5,
  'PC Optimum Points': 0.7,
  'CT Money': 1.0,
  'CT Money (Rewards)': 1.0,
  'AIR MILES': 1.0,
  'Brim Rewards Points': 0.7,
  'VIPorter Points': 1.0,
  'Flying Blue Miles': 1.5,
  'MBNA Rewards Points': 0.5,
  'A la carte Rewards Points': 0.8,
  'À la carte Rewards Points': 0.8,
  'Marriott Bonvoy Points': 0.8,
  'RBC Rewards': 0.7,
  'Adapta Points': 0.5,
  'Low Interest': 0,
  'None': 0,
  'No Foreign Conversion': 0,
  'No rewards': 0,
}

function getCpp(rewardType: string): number {
  return POINT_VALUES[rewardType] ?? 1.0
}

// Typical welcome bonus points for known cards (used for first-year projections).
const WELCOME_BONUSES: Record<string, number> = {
  'Cobalt Card':                      30000,
  'Gold Rewards Card':                40000,
  'Platinum Card':                    80000,
  'Aeroplan Visa Infinite':           25000,
  'Aeroplan Visa Infinite Privilege': 50000,
  'Aventura Visa Infinite':           20000,
  'Scotia Gold American Express':     30000,
  'Eclipse Visa Infinite':            50000,
  'Avion Visa Infinite':              25000,
  'Cash Back Visa Infinite':          0,
  'Dividend Visa Infinite':           0,
  'WestJet RBC World Elite':          450,
  'Scene+ Visa Infinite':             25000,
  'Triangle World Elite Mastercard':  25000,
  'PC Financial World Elite':         50000,
  'Passport Visa Infinite':           30000,
  'Aeroplan Reserve':                 50000,
}

function getWelcomeBonus(cardName: string): number {
  if (WELCOME_BONUSES[cardName] !== undefined) return WELCOME_BONUSES[cardName]
  const lower = cardName.toLowerCase().trim()
  for (const [key, bonus] of Object.entries(WELCOME_BONUSES)) {
    const keyLower = key.toLowerCase()
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return bonus
    }
  }
  return 0
}

function isNoFxFeeCard(t: CardTemplate): boolean {
  return t.has_no_fx_fee
}

function isAmexCard(template: CardTemplate): boolean {
  return template.issuer === 'Amex' || template.card_name.includes('American Express')
}

function getApplyUrl(cardName: string, issuer: string): string {
  const query = encodeURIComponent(`${issuer} ${cardName} apply canada`)
  return `https://www.google.com/search?q=${query}`
}

function scoreCard(
  t: CardTemplate,
  annualSpend: Record<string, number>,
  topCategories: string[],
  foreignCurrencySpend: number,
): QuizResult {
  const rates = getRates(t.card_name)
  const cpp = getCpp(t.reward_type)

  let totalPoints = 0
  let totalValue = 0
  const valueBreakdown: { category: string; value: number; points: number }[] = []

  for (const cat of Object.keys(annualSpend) as (keyof typeof annualSpend)[]) {
    const pts = annualSpend[cat] * rates[cat as keyof CategoryRates]
    const val = pts * cpp / 100 // convert points × cpp to dollars
    totalPoints += pts
    totalValue += val
    if (cat !== 'general' && pts > 0) {
      valueBreakdown.push({ category: cat, value: Math.round(val * 100) / 100, points: Math.round(pts) })
    }
  }

  // FX fee savings for no-FX-fee cards (2.5% of foreign spend)
  let fxSavings = 0
  if (isNoFxFeeCard(t) && foreignCurrencySpend > 0) {
    fxSavings = Math.round(foreignCurrencySpend * 0.025 * 100) / 100
    totalValue += fxSavings
    valueBreakdown.push({ category: 'FX savings', value: fxSavings, points: 0 })
  }

  valueBreakdown.sort((a, b) => b.value - a.value)

  // Welcome bonus
  const wbPoints = getWelcomeBonus(t.card_name)
  const wbValue = Math.round(wbPoints * cpp) / 100

  const reasons: string[] = []
  for (const cat of topCategories) {
    const rate = rates[cat as keyof CategoryRates]
    if (rate >= 3) {
      const effectiveReturn = (rate * cpp / 100 * 100).toFixed(1)
      reasons.push(`${effectiveReturn}% back on ${cat}`)
    }
  }
  if (reasons.length === 0) {
    let bestCat = 'general'
    let bestRate = 1
    for (const cat of Object.keys(rates) as (keyof CategoryRates)[]) {
      if (rates[cat] > bestRate) { bestRate = rates[cat]; bestCat = cat }
    }
    if (bestRate > 1) {
      const effectiveReturn = (bestRate * cpp / 100 * 100).toFixed(1)
      reasons.push(`${effectiveReturn}% back on ${bestCat}`)
    }
  }
  if (fxSavings > 0) reasons.push('No FX fees')
  if (t.annual_fee === 0) reasons.push('No annual fee')
  if (t.perks) reasons.push(t.perks.split(';')[0].trim())

  const netAnnualValue = Math.round((totalValue - t.annual_fee) * 100) / 100
  const firstYearValue = Math.round((netAnnualValue + wbValue) * 100) / 100

  return {
    card_name: t.card_name,
    issuer: t.issuer,
    annual_fee: t.annual_fee,
    reward_type: t.reward_type,
    score: totalValue,
    annualPoints: Math.round(totalPoints),
    centsPerPoint: cpp,
    netAnnualValue,
    firstYearValue,
    welcomeBonusPoints: wbPoints,
    welcomeBonusValue: wbValue,
    fxSavings,
    matchReason: reasons.slice(0, 3).join(' · '),
    matchPercent: 0,
    perks: t.perks,
    credits_included: t.credits_included,
    isAmex: isAmexCard(t),
    valueBreakdown: valueBreakdown.slice(0, 3),
  }
}

function calculateResults(answers: QuizAnswers, templates: CardTemplate[]): QuizResultSet {
  // Annual spending per category
  const annualSpend = {
    dining: answers.dining * 12,
    groceries: answers.groceries * 12,
    gas: answers.gas * 12,
    travel: answers.travel * 12,
    transit: answers.transit * 12,
    streaming: answers.streaming * 12,
    general: 500 * 12, // assume ~$500/mo general spend
  }

  // Find top spending categories
  const spendEntries = Object.entries(annualSpend)
    .filter(([k]) => k !== 'general')
    .sort((a, b) => b[1] - a[1])
  const topCategories = spendEntries.filter(([, v]) => v > 0).slice(0, 3).map(([k]) => k)

  // Foreign currency spend is already annual (not monthly)
  const foreignCurrencySpend = Math.max(0, answers.foreignCurrency)

  // Filter templates by fee tolerance only (no AMEX filter — we show both)
  const filtered = templates.filter((t) => t.annual_fee <= answers.feeTolerance)

  // Score each card
  const scored = filtered.map((t) => scoreCard(t, annualSpend, topCategories, foreignCurrencySpend))

  // Sort by net annual value (rewards value minus annual fee)
  scored.sort((a, b) => b.netAnnualValue - a.netAnnualValue)

  // Calculate match percentages relative to top net value
  const maxValue = scored[0]?.netAnnualValue || 1
  for (const r of scored) {
    r.matchPercent = Math.max(0, Math.round((r.netAnnualValue / maxValue) * 100))
  }

  const top = scored.slice(0, 3)

  // Non-AMEX alternative: when user shops at Costco (occasionally or frequently),
  // find the best non-AMEX card not already in top 3
  let nonAmexPick: QuizResult | null = null
  if (answers.costco >= 1) {
    const topNames = new Set(top.map((r) => r.card_name))
    const bestNonAmex = scored.find((r) => !r.isAmex && !topNames.has(r.card_name))
    // Only show if top results contain at least one AMEX card
    const topHasAmex = top.some((r) => r.isAmex)
    if (bestNonAmex && topHasAmex) {
      nonAmexPick = bestNonAmex
    }
  }

  // Welcome bonus picks: if big purchase planned, suggest high-fee cards not already in top 3
  const welcomeBonus: QuizResult[] = []
  if (answers.bigPurchase === 1) {
    const topNames = new Set(top.map((r) => r.card_name))
    if (nonAmexPick) topNames.add(nonAmexPick.card_name)
    const premiumCards = templates
      .filter((t) => {
        if (topNames.has(t.card_name)) return false
        return t.annual_fee >= 100
      })
      .sort((a, b) => b.annual_fee - a.annual_fee)

    for (const t of premiumCards.slice(0, 3)) {
      const result = scoreCard(t, annualSpend, topCategories, foreignCurrencySpend)
      const timelineLabel = answers.bigPurchaseTimeline <= 2 ? 'soon' :
        answers.bigPurchaseTimeline <= 4 ? 'in 2-4 months' :
        answers.bigPurchaseTimeline <= 6 ? 'in 4-6 months' : 'within a year'
      result.matchReason = `Premium card with welcome bonus potential · Big purchase ${timelineLabel}`
      result.matchPercent = Math.max(0, Math.round((result.netAnnualValue / maxValue) * 100))
      welcomeBonus.push(result)
    }
  }

  return { top, nonAmexPick, welcomeBonus }
}

export default function RecommendationsPage() {
  const supabase = createClient()
  const [cards, setCards] = useState<Card[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [loading, setLoading] = useState(true)

  // Quiz state
  const [quizStep, setQuizStep] = useState(0) // 0 = not started, 1-10 = questions, 11 = results
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({ ...DEFAULT_ANSWERS })
  const [quizResults, setQuizResults] = useState<QuizResultSet>({ top: [], nonAmexPick: null, welcomeBonus: [] })

  useEffect(() => {
    async function load() {
      const [cardsRes, templatesRes] = await Promise.all([
        supabase.from('credit_cards').select('id, card_name, bank_name, status'),
        supabase.from('card_templates').select('id, card_name, issuer, annual_fee, reward_type, card_type, perks, credits_included, has_no_fx_fee').order('issuer'),
      ])
      if (cardsRes.data) setCards(cardsRes.data)
      if (templatesRes.data) setTemplates(templatesRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const recommendations = getBestCards(cards)

  // Quiz navigation helpers
  function getVisibleQuestionIndex(step: number): number {
    // step is 1-based question number; we need to find which QUESTIONS index it maps to
    // accounting for skipped questions
    let visible = 0
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]
      if (q.skipIf && q.skipIf(quizAnswers)) continue
      visible++
      if (visible === step) return i
    }
    return QUESTIONS.length - 1
  }

  function getTotalVisibleQuestions(): number {
    return QUESTIONS.filter((q) => !q.skipIf || !q.skipIf(quizAnswers)).length
  }

  function handleStartQuiz() {
    setQuizStep(1)
    setQuizAnswers({ ...DEFAULT_ANSWERS })
    setQuizResults({ top: [], nonAmexPick: null, welcomeBonus: [] })
  }

  function handleAnswer(value: number) {
    const qIndex = getVisibleQuestionIndex(quizStep)
    const q = QUESTIONS[qIndex]
    const updated = { ...quizAnswers, [q.key]: value }
    setQuizAnswers(updated)

    const totalVisible = QUESTIONS.filter((qu) => !qu.skipIf || !qu.skipIf(updated)).length
    if (quizStep >= totalVisible) {
      // Last question — compute results
      const results = calculateResults(updated, templates)
      setQuizResults(results)
      setQuizStep(totalVisible + 1) // results step
    } else {
      setQuizStep(quizStep + 1)
    }
  }

  function handleBack() {
    if (quizStep <= 1) return
    setQuizStep(quizStep - 1)
  }

  function handleRetake() {
    setQuizStep(0)
    setQuizAnswers({ ...DEFAULT_ANSWERS })
    setQuizResults({ top: [], nonAmexPick: null, welcomeBonus: [] })
  }

  const totalVisible = getTotalVisibleQuestions()
  const isResults = quizStep > totalVisible && quizStep > 0
  const currentQIndex = quizStep > 0 && !isResults ? getVisibleQuestionIndex(quizStep) : -1
  const currentQuestion = currentQIndex >= 0 ? QUESTIONS[currentQIndex] : null

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
              <Link href="/recommendations" className="text-sm font-semibold text-gray-900">Recommendations</Link>
              <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recommendations</h1>

        {cards.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
            <p className="text-sm font-medium text-gray-500">Active Cards</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{cards.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing best card per spending category based on your wallet
            </p>
          </div>
        )}

        {/* Quiz section */}
        {quizStep === 0 ? (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 mb-6 bg-blue-50/50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">Spending Quiz</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Take a quick spending quiz to get personalized card recommendations tailored to your habits.
                </p>
              </div>
              <button
                onClick={handleStartQuiz}
                className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shrink-0 ml-4"
              >
                Take Quiz
              </button>
            </div>
          </div>
        ) : isResults ? (
          /* Results */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Personalized Recommendations</h2>
                <p className="text-sm text-gray-500 mt-1">Based on your spending profile</p>
              </div>
              <button
                onClick={handleRetake}
                className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Retake Quiz
              </button>
            </div>

            {quizResults.top.length === 0 ? (
              <p className="text-gray-500 text-sm">No cards match your criteria. Try adjusting your fee tolerance.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quizResults.top.map((result, i) => (
                  <div
                    key={result.card_name}
                    className={`rounded-lg border p-5 flex flex-col ${i === 0 ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-200' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {i === 0 && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Best Value
                        </span>
                      )}
                      {result.isAmex && (
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          AMEX
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{result.card_name}</h3>
                    <p className="text-sm text-gray-500">{result.issuer}</p>

                    {/* Value projection */}
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Expected First Year</p>
                      <p className="text-xl font-bold text-green-700">${Math.round(result.firstYearValue).toLocaleString()}</p>
                      {result.welcomeBonusPoints > 0 && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          Includes ~{result.welcomeBonusPoints.toLocaleString()} pt welcome bonus (${Math.round(result.welcomeBonusValue)})
                        </p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Ongoing annual value</span>
                          <span className="font-medium text-gray-700">${Math.round(result.netAnnualValue).toLocaleString()}/yr</span>
                        </div>
                      </div>
                      {result.valueBreakdown.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {result.valueBreakdown.map((b) => (
                            <div key={b.category} className="flex justify-between text-xs text-gray-500">
                              <span className="capitalize">{b.category}</span>
                              <span>${b.value.toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Match</span>
                        <span className="font-semibold text-gray-900">{result.matchPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${result.matchPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Annual Fee</span>
                        <span className="font-medium text-gray-900">
                          {result.annual_fee === 0 ? 'Free' : `$${result.annual_fee}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Reward Type</span>
                        <span className="font-medium text-gray-900">{result.reward_type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Point Value</span>
                        <span className="font-medium text-gray-900">{result.centsPerPoint}&#162;/pt</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Annual Points</span>
                        <span className="font-medium text-gray-900">{result.annualPoints.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{result.matchReason}</p>
                    {result.credits_included && (
                      <p className="text-xs text-green-700 mt-1">{result.credits_included}</p>
                    )}
                    <div className="mt-auto pt-4">
                      <a
                        href={getApplyUrl(result.card_name, result.issuer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Non-AMEX alternative */}
            {quizResults.nonAmexPick && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-1">Non-AMEX Alternative</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Accepted everywhere including Costco and stores that don&apos;t take American Express.
                </p>
                <div className="rounded-lg border border-green-200 bg-green-50/30 p-5 max-w-sm">
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-3 inline-block">
                    Visa / Mastercard
                  </span>
                  <h3 className="font-semibold text-gray-900">{quizResults.nonAmexPick.card_name}</h3>
                  <p className="text-sm text-gray-500">{quizResults.nonAmexPick.issuer}</p>
                  <div className="mt-3 bg-white/60 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Expected First Year</p>
                    <p className="text-xl font-bold text-green-700">${Math.round(quizResults.nonAmexPick.firstYearValue).toLocaleString()}</p>
                    {quizResults.nonAmexPick.welcomeBonusPoints > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        Includes ~{quizResults.nonAmexPick.welcomeBonusPoints.toLocaleString()} pt welcome bonus (${Math.round(quizResults.nonAmexPick.welcomeBonusValue)})
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Ongoing annual value</span>
                        <span className="font-medium text-gray-700">${Math.round(quizResults.nonAmexPick.netAnnualValue).toLocaleString()}/yr</span>
                      </div>
                    </div>
                    {quizResults.nonAmexPick.valueBreakdown.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {quizResults.nonAmexPick.valueBreakdown.map((b) => (
                          <div key={b.category} className="flex justify-between text-xs text-gray-500">
                            <span className="capitalize">{b.category}</span>
                            <span>${b.value.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Match</span>
                      <span className="font-semibold text-gray-900">{quizResults.nonAmexPick.matchPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Annual Fee</span>
                      <span className="font-medium text-gray-900">
                        {quizResults.nonAmexPick.annual_fee === 0 ? 'Free' : `$${quizResults.nonAmexPick.annual_fee}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Point Value</span>
                      <span className="font-medium text-gray-900">{quizResults.nonAmexPick.centsPerPoint}&#162;/pt</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Annual Points</span>
                      <span className="font-medium text-gray-900">{quizResults.nonAmexPick.annualPoints.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{quizResults.nonAmexPick.matchReason}</p>
                  <div className="mt-4">
                    <a
                      href={getApplyUrl(quizResults.nonAmexPick.card_name, quizResults.nonAmexPick.issuer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome bonus picks */}
            {quizResults.welcomeBonus.length > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-900 mb-1">Welcome Bonus Picks</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Great options if you have a big purchase coming up and want to hit a welcome bonus.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quizResults.welcomeBonus.map((result) => (
                    <div key={result.card_name} className="rounded-lg border border-amber-200 bg-amber-50/30 p-5 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Welcome Bonus
                        </span>
                        {result.isAmex && (
                          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            AMEX
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{result.card_name}</h3>
                      <p className="text-sm text-gray-500">{result.issuer}</p>
                      <div className="mt-3 bg-white/60 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Expected First Year</p>
                        <p className="text-xl font-bold text-green-700">${Math.round(result.firstYearValue).toLocaleString()}</p>
                        {result.welcomeBonusPoints > 0 && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            Includes ~{result.welcomeBonusPoints.toLocaleString()} pt welcome bonus (${Math.round(result.welcomeBonusValue)})
                          </p>
                        )}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Ongoing annual value</span>
                            <span className="font-medium text-gray-700">${Math.round(result.netAnnualValue).toLocaleString()}/yr</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Annual Fee</span>
                          <span className="font-medium text-gray-900">${result.annual_fee}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Point Value</span>
                          <span className="font-medium text-gray-900">{result.centsPerPoint}&#162;/pt</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Annual Points</span>
                          <span className="font-medium text-gray-900">{result.annualPoints.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">{result.matchReason}</p>
                      {result.perks && (
                        <p className="text-xs text-gray-500 mt-1">{result.perks}</p>
                      )}
                      <div className="mt-auto pt-4">
                        <a
                          href={getApplyUrl(result.card_name, result.issuer)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-sm font-medium px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                        >
                          Apply Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentQuestion ? (
          /* Quiz stepper */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Spending Quiz</h2>
              <span className="text-sm text-gray-500">
                Question {quizStep} of {totalVisible}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(quizStep / totalVisible) * 100}%` }}
              />
            </div>

            <p className="text-gray-900 font-medium mb-4">{currentQuestion.question}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleAnswer(opt.value)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    quizAnswers[currentQuestion.key] === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={quizStep === 1 ? handleRetake : handleBack}
                className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {quizStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <div />
            </div>
          </div>
        ) : null}

        {cards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400">No active cards found</p>
              <p className="text-sm text-gray-400 mt-1">Add cards to see which one to use for each spending category.</p>
              <Link
                href="/cards"
                className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Cards
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(({ key, label, icon, bestCard, bestRate }) => (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                </div>
                {bestCard ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">{bestCard.card_name}</p>
                    <p className="text-sm text-gray-500">{bestCard.bank_name}</p>
                    <div className="mt-2">
                      <span className="inline-block text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {bestRate}x per dollar
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No card data available</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
