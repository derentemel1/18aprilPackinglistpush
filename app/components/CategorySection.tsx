'use client'

import { useState } from 'react'
import type { Category, Item, Bag } from '../types'

const BAGS: Bag[] = ['Luggage A', 'Luggage B', 'Carry-On', 'Personal Item']

const BAG_EMOJI: Record<Bag, string> = {
  'Luggage A': '🧳',
  'Luggage B': '🧳',
  'Carry-On': '✈️',
  'Personal Item': '👜',
}

const BAG_COLOR: Record<Bag, string> = {
  'Luggage A': 'bg-blue-100 text-blue-700',
  'Luggage B': 'bg-purple-100 text-purple-700',
  'Carry-On': 'bg-orange-100 text-orange-700',
  'Personal Item': 'bg-pink-100 text-pink-700',
}

interface Props {
  category: Category
  items: Item[]
  checked: Set<string>
  showPerson: boolean
  isGuest: boolean
  onToggle: (itemId: string) => void
  onBagChange: (itemId: string, bag: Bag | null) => void
  onDeleteItem: (itemId: string) => void
  onAddItem: (categoryId: string, name: string) => void
  onDeleteCategory: (categoryId: string) => void
}

export default function CategorySection({
  category, items, checked, showPerson, isGuest,
  onToggle, onBagChange, onDeleteItem, onAddItem, onDeleteCategory,
}: Props) {
  const [adding, setAdding] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  const catPacked = items.filter(item => checked.has(item.id)).length
  const personLabel = category.person === 'AILA' ? '🧒 Aila' : '👩 Trinh'

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return
    onAddItem(category.id, newItemName.trim())
    setNewItemName('')
    setAdding(false)
  }

  return (
    <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div>
          {showPerson && (
            <p className="text-xs text-slate-400 mb-0.5">{personLabel}</p>
          )}
          <h2 className="font-semibold text-slate-700 text-sm">{category.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            items.length > 0 && catPacked === items.length
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {catPacked}/{items.length}
          </span>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="text-slate-300 hover:text-red-400 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Items */}
      <ul>
        {items.map((item, i) => {
          const done = checked.has(item.id)
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                i > 0 ? 'border-t border-slate-50' : ''
              } ${done ? 'bg-green-50' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(item.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  done ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                }`}
              >
                {done && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Name */}
              <span className={`flex-1 text-sm leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {item.name}
              </span>

              {/* Bag selector */}
              <select
                value={item.bag ?? ''}
                onChange={e => onBagChange(item.id, (e.target.value as Bag) || null)}
                className={`text-xs rounded-full px-2 py-0.5 border-0 outline-none cursor-pointer max-w-[110px] ${
                  item.bag ? BAG_COLOR[item.bag] : 'bg-slate-100 text-slate-400'
                }`}
              >
                <option value="">— bag</option>
                {BAGS.map(b => (
                  <option key={b} value={b}>{BAG_EMOJI[b]} {b}</option>
                ))}
              </select>

              {/* Delete */}
              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-slate-300 hover:text-red-400 text-xl leading-none flex-shrink-0 transition-colors"
              >
                ×
              </button>
            </li>
          )
        })}

        {/* Add item */}
        {adding ? (
          <li className="border-t border-slate-50">
            <form onSubmit={handleAddItem} className="flex items-center gap-2 px-4 py-3">
              <input
                autoFocus
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Item name…"
                className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-300"
                onKeyDown={e => e.key === 'Escape' && setAdding(false)}
              />
              <button type="submit" className="text-teal-500 text-sm font-semibold">Add</button>
              <button type="button" onClick={() => setAdding(false)} className="text-slate-400 text-sm">Cancel</button>
            </form>
          </li>
        ) : (
          <li className="border-t border-slate-50">
            <button
              onClick={() => setAdding(true)}
              className="w-full px-4 py-3 text-left text-sm text-teal-500 hover:bg-slate-50 transition-colors"
            >
              ＋ Add item
            </button>
          </li>
        )}
      </ul>
    </section>
  )
}
