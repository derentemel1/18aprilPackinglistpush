'use client'

import { useState, useEffect } from 'react'

const DATA = {
  AILA: {
    Clothing: [
      'Swimsuit + Floatie',
      '5 x Pyjamas',
      'Cardigan',
      'Jacket w/ hood',
      'Socks',
      '5 Shirts + 5 Pants',
      'Hat',
      'Flight outfits',
    ],
    Eat: [
      'Assortment of snacks',
      '2 x bibs',
      'Spoons + Forks (to leave in VN)',
      '2 sippy cups',
      '3 x travel bibs',
      'Travel water bottle',
    ],
    Hygiene: [
      'Diapers',
      '2 x Diaper changing liners',
      'Wipes',
      'Alcohol spray',
      "Aila's Toiletry bag",
      'Toothbrush + toothpaste',
    ],
    'On the Go': ['Doona (car seat/stroller)', 'Large bag for Doona', 'Baby carrier'],
    Papers: ['Notarized consent for travel', 'Bassinet seat confirmation', '2 Passports'],
    Play: [
      'Toys / Masking tape',
      'Toys / Orange tube',
      'Toys / Busy Book',
      'Toys / 2-3 interactive books',
      'Download Ms. Rachel (tablet)',
      'Toys / Duplos',
      'Toys / Crayons + Paper',
    ],
    Shoes: ['2 Boots + Shoes'],
    Sleep: ['Baby Monitor', '2 x Blankets', 'Noise machine'],
  },
  TRINH: {
    Clothing: [
      '5 x Shirts + 5 x Pants',
      'Pyjamas',
      'Undergarments',
      'Swimsuits',
      'NF black jacket',
    ],
    Hygiene: ['Skincare bag', 'Toiletry bag', 'Makeup bag', 'Pads + Liners'],
    'On the Go': [
      'On-flight bag (neck pillow, eye mask, chapstick)',
      'Salomon Shoes',
      'Wallet',
      'Water bottle',
      '1 T-shirt to change',
      'Sunglasses',
    ],
    Papers: ['Passport + Green Card'],
    Shoes: ['Birkenstock Flipflops + Red Ballet Shoes'],
    Work: ['Pouch with all Chargers', 'Laptop', 'Headphones', 'Notebook + Pen', 'Stanley cup'],
  },
} as const

type Person = keyof typeof DATA
const STORAGE_KEY = 'packing-v1'

function id(person: string, cat: string, item: string) {
  return `${person}||${cat}||${item}`
}

export default function Page() {
  const [tab, setTab] = useState<Person>('AILA')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setChecked(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])

  function toggle(key: string) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function resetTab() {
    if (!confirm(`Reset all items for ${tab}?`)) return
    setChecked(prev => {
      const next = { ...prev }
      Object.entries(DATA[tab]).forEach(([cat, items]) => {
        items.forEach(item => delete next[id(tab, cat, item)])
      })
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const categories = DATA[tab]
  const allKeys = Object.entries(categories).flatMap(([cat, items]) =>
    items.map(item => id(tab, cat, item))
  )
  const packed = allKeys.filter(k => checked[k]).length
  const total = allKeys.length
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0

  const accentBg = tab === 'AILA' ? 'bg-teal-500' : 'bg-violet-500'
  const accentText = tab === 'AILA' ? 'text-teal-600' : 'text-violet-600'
  const accentBorder = tab === 'AILA' ? 'border-teal-500' : 'border-violet-500'

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-10 max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 pt-5 pb-3">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">✈️ Vietnam Packing</h1>
            <p className="text-xs text-slate-400 mt-0.5">April 2026</p>
          </div>
          <span className="text-sm font-semibold text-slate-500">{packed}/{total} packed</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`${accentBg} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`text-right text-xs font-bold mt-1 ${accentText}`}>{pct}%</p>

        {/* Person tabs */}
        <div className="flex gap-2 mt-3">
          {(['AILA', 'TRINH'] as Person[]).map(p => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                tab === p
                  ? `${accentBg} text-white border-transparent`
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {p === 'AILA' ? '🧒 Aila' : '👩 Trinh'}
            </button>
          ))}
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 pt-4 space-y-4">
        {Object.entries(categories).map(([cat, items]) => {
          const catKeys = items.map(item => id(tab, cat, item))
          const catPacked = catKeys.filter(k => checked[k]).length
          return (
            <section key={cat} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-semibold text-slate-700 text-sm">{cat}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  catPacked === items.length
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {catPacked}/{items.length}
                </span>
              </div>
              <ul>
                {items.map((item, i) => {
                  const key = id(tab, cat, item)
                  const done = !!checked[key]
                  return (
                    <li
                      key={i}
                      onClick={() => toggle(key)}
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition-colors active:bg-slate-50 ${
                        i > 0 ? 'border-t border-slate-50' : ''
                      } ${done ? 'bg-green-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          done ? `${accentBg} ${accentBorder} border-transparent` : 'border-slate-300'
                        }`}
                      >
                        {done && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        {/* Reset */}
        <button
          onClick={resetTab}
          className="w-full mt-2 mb-6 py-3 text-sm text-red-400 border border-red-100 rounded-2xl bg-white hover:bg-red-50 transition-colors"
        >
          Reset {tab === 'AILA' ? "Aila's" : "Trinh's"} list
        </button>
      </div>
    </main>
  )
}
