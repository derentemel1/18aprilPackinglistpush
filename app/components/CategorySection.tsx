'use client'

import { useState } from 'react'
import type { Category, Item, Bag } from '../types'

const BAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
]


function bagColor(bag: string, bags: string[]) {
  return BAG_COLORS[bags.indexOf(bag) % BAG_COLORS.length] ?? 'bg-slate-100 text-slate-500'
}

interface Props {
  category: Category
  items: Item[]
  checked: Set<string>
  ownerLabel?: string
  bags: string[]
  onToggle: (itemId: string) => void
  onBagChange: (itemId: string, bag: Bag | null) => void
  onDeleteItem: (itemId: string) => void
  onAddItem: (categoryId: string, name: string) => void
  onAddItems: (categoryId: string, names: string[]) => void
  onDeleteCategory: (categoryId: string) => void
  readOnly?: boolean
}

function parsePastedList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/^[\s•\-\*·\u2022\u2023\u25E6\u2043]+/, '').trim())
    .filter(line => line.length > 0)
}

export default function CategorySection({
  category, items, checked, ownerLabel, bags, readOnly,
  onToggle, onBagChange, onDeleteItem, onAddItem, onAddItems, onDeleteCategory,
}: Props) {
  const catPacked = items.filter(item => checked.has(item.id)).length
  const allPacked = items.length > 0 && catPacked === items.length
  const [collapsed, setCollapsed] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return
    onAddItem(category.id, newItemName.trim())
    setNewItemName('')
    setAdding(false)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text')
    const lines = parsePastedList(text)
    if (lines.length > 1) {
      e.preventDefault()
      onAddItems(category.id, lines)
      setNewItemName('')
      setAdding(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      {/* Header — tap to collapse */}
      <div
        className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <div>
          {ownerLabel && <p className="text-xs text-slate-400 mb-0.5">{ownerLabel}</p>}
          <h2 className="font-semibold text-slate-700 text-sm">{category.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            allPacked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {catPacked}/{items.length}
          </span>
          {!readOnly && (
            <button
              onClick={e => { e.stopPropagation(); onDeleteCategory(category.id) }}
              className="text-slate-300 hover:text-red-400 text-xl leading-none transition-colors p-2 -mr-1"
            >×</button>
          )}
          <span className="text-slate-400 text-xs">{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>

      {!collapsed && (
        <ul>
          {items.map((item, i) => {
            const done = checked.has(item.id)
            return (
              <li
                key={item.id}
                className={`flex items-center gap-3 px-4 py-4 tap-row ${i > 0 ? 'border-t border-slate-50' : ''} ${done ? 'bg-green-50' : ''}`}
              >
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

                <span className={`flex-1 text-sm leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.name}
                </span>

                <select
                  value={item.bag ?? ''}
                  onChange={e => onBagChange(item.id, e.target.value || null)}
                  className={`text-sm rounded-full px-2 py-1.5 border-0 outline-none cursor-pointer max-w-[120px] ${
                    item.bag ? bagColor(item.bag, bags) : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <option value="">— bag</option>
                  {bags.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {!readOnly && (
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-slate-300 hover:text-red-400 text-xl leading-none flex-shrink-0 transition-colors p-2 -mr-2"
                  >×</button>
                )}
              </li>
            )
          })}

          {!readOnly && (
            adding ? (
              <li className="border-t border-slate-50">
                <form onSubmit={handleAddItem} className="flex items-center gap-2 px-4 py-3">
                  <input
                    autoFocus
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Item name… or paste a list"
                    className="flex-1 text-base outline-none bg-transparent text-slate-700 placeholder-slate-300"
                    onKeyDown={e => e.key === 'Escape' && setAdding(false)}
                  />
                  <button type="submit" className="text-teal-500 text-sm font-semibold px-3 py-2 -mr-1">Add</button>
                  <button type="button" onClick={() => setAdding(false)} className="text-slate-400 text-sm px-3 py-2 -mr-1">Cancel</button>
                </form>
              </li>
            ) : (
              <li className="border-t border-slate-50">
                <button
                  onClick={() => setAdding(true)}
                  className="w-full px-4 py-4 text-left text-sm text-teal-500 tap-row transition-colors"
                >
                  ＋ Add item
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  )
}
