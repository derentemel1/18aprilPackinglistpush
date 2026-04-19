'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import CategorySection from '../CategorySection'
import type { User } from '@supabase/supabase-js'
import type { Category, Item, Bag, BagFilter, Traveler } from '../../types'

function namedBags(travelerId: string | null, travelerNickname: string | undefined, journeyTravelers: Traveler[], travelerBags: Record<string, string[]>): string[] {
  if (travelerId !== null) {
    return (travelerBags[travelerId] ?? []).map(b => `${travelerNickname}'s ${b}`)
  }
  return journeyTravelers.flatMap(t => (travelerBags[t.id] ?? []).map(b => `${t.nickname}'s ${b}`))
}

function statusLabel(status: string) {
  if (status === 'baby') return 'Baby'
  if (status === 'minor') return 'Kid'
  return 'Adult'
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    baby:  'bg-rose-100 text-rose-500',
    minor: 'bg-sky-100 text-sky-500',
    adult: 'bg-teal-100 text-teal-600',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {statusLabel(status)}
    </span>
  )
}

const LOCAL_CHECKED_KEY = 'packing-checked-v2'

const BABY_DEFAULTS: { name: string; items: string[] }[] = [
  { name: 'Travel Documents', items: [] },
  { name: 'Drinks & Snacks', items: [] },
  { name: 'Diaper Essentials', items: [] },
  { name: 'Clothing', items: [] },
  { name: 'Fun & Games', items: [] },
  { name: 'Comfort', items: [] },
  { name: 'Carseat / Stroller', items: [] },
]

const ADULT_MINOR_DEFAULTS: { name: string; items: string[] }[] = [
  { name: 'Travel Documents & Money', items: [] },
  { name: 'Clothing', items: [] },
  { name: 'Shoes', items: [] },
  { name: 'Toiletries', items: [] },
  { name: 'Medications & Health', items: [] },
  { name: 'Electronics', items: [] },
  { name: 'Travel Comfort', items: [] },
  { name: 'Snacks & Drinks', items: [] },
  { name: 'Entertainment', items: [] },
  { name: 'Work or Personal Items', items: [] },
  { name: 'Weather / Activity Gear', items: [] },
  { name: 'Laundry & Organization', items: [] },
  { name: 'Emergency / Backup Items', items: [] },
]


function generateBags(luggage: number, carryOn: number, personal: number): string[] {
  const bags: string[] = []
  if (luggage === 1) bags.push('Luggage')
  else for (let i = 0; i < luggage; i++) bags.push(`Luggage ${'ABCD'[i]}`)
  if (carryOn === 1) bags.push('Carry-On')
  else for (let i = 0; i < carryOn; i++) bags.push(`Carry-On ${i + 1}`)
  if (personal === 1) bags.push('Personal Item')
  else for (let i = 0; i < personal; i++) bags.push(`Personal Item ${i + 1}`)
  return bags
}

function loadCount(key: string, def: number) {
  if (typeof window === 'undefined') return def
  const v = localStorage.getItem(key)
  return v !== null ? Number(v) : def
}

interface Props {
  user: User | 'guest'
  journeyId: string
  journeyName: string
  travelerId: string | null
  travelerEmoji?: string
  travelerNickname?: string
  journeyTravelers: Traveler[]
  travelerBags: Record<string, string[]>
  onBack: () => void
}

export default function PackingScreen({
  user, journeyId, journeyName, travelerId,
  travelerEmoji, travelerNickname, journeyTravelers, travelerBags, onBack,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [bagFilter, setBagFilter] = useState<BagFilter>('ALL')
  const [ready, setReady] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const isMaster = travelerId === null
  const isGuest = user === 'guest'
  const bags = journeyTravelers.flatMap(t => (travelerBags[t.id] ?? []).map(b => `${t.nickname}'s ${b}`))

  async function seedDefaults(travelerStatus: string) {
    const defaults = travelerStatus === 'baby' ? BABY_DEFAULTS : ADULT_MINOR_DEFAULTS
    const newCats: Category[] = []
    const newItems: Item[] = []

    for (let pos = 0; pos < defaults.length; pos++) {
      const def = defaults[pos]
      const { data: cat } = await supabase
        .from('categories')
        .insert({ name: def.name, position: pos, journey_id: journeyId, traveler_id: travelerId, person: 'AILA' })
        .select().single()
      if (!cat) continue
      newCats.push(cat)

      const itemInserts = def.items.map((name, i) => ({ category_id: cat.id, name, position: i }))
      const { data: its } = await supabase.from('items').insert(itemInserts).select()
      if (its) newItems.push(...its)
    }

    setCategories(newCats)
    setItems(newItems)
  }

  const loadData = useCallback(async () => {
    setReady(false)
    let catQuery = supabase.from('categories').select('*').eq('journey_id', journeyId)
    if (!isMaster) catQuery = catQuery.eq('traveler_id', travelerId)

    const { data: cats } = await catQuery.order('position')

    if (!isMaster && !isGuest && (!cats || cats.length === 0)) {
      const traveler = journeyTravelers.find(t => t.id === travelerId)
      if (traveler) {
        await seedDefaults(traveler.status)
        const { data } = await supabase.from('checked_items').select('item_id').eq('user_id', (user as User).id)
        setChecked(new Set(data?.map(r => r.item_id) ?? []))
        setReady(true)
        return
      }
    }

    setCategories(cats ?? [])

    if (cats && cats.length > 0) {
      const { data: its } = await supabase
        .from('items').select('*')
        .in('category_id', cats.map(c => c.id))
        .order('position')
      setItems(its ?? [])
    } else {
      setItems([])
    }

    if (isGuest) {
      try {
        const raw = localStorage.getItem(LOCAL_CHECKED_KEY)
        if (raw) setChecked(new Set(JSON.parse(raw)))
      } catch {}
    } else {
      const { data } = await supabase.from('checked_items').select('item_id').eq('user_id', (user as User).id)
      setChecked(new Set(data?.map(r => r.item_id) ?? []))
    }
    setReady(true)
  }, [journeyId, travelerId, isMaster, isGuest, user, journeyTravelers])

  useEffect(() => { loadData() }, [loadData])

  async function toggle(itemId: string) {
    const next = new Set(checked)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    setChecked(next)

    if (isGuest) {
      try { localStorage.setItem(LOCAL_CHECKED_KEY, JSON.stringify([...next])) } catch {}
      return
    }
    if (next.has(itemId)) {
      await supabase.from('checked_items').upsert({ user_id: (user as User).id, item_id: itemId })
    } else {
      await supabase.from('checked_items').delete().eq('user_id', (user as User).id).eq('item_id', itemId)
    }
  }

  async function handleBagChange(itemId: string, bag: Bag | null) {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, bag } : it))
    const { data, error } = await supabase.from('items').update({ bag }).eq('id', itemId).select()
    if (error) console.error('bag update error:', error)
    else if (!data || data.length === 0) console.warn('bag update: 0 rows updated — likely blocked by RLS')
    else console.log('bag update success:', data)
  }

  async function handleAddItem(categoryId: string, name: string) {
    const maxPos = items.filter(i => i.category_id === categoryId).length
    const { data } = await supabase
      .from('items').insert({ category_id: categoryId, name, position: maxPos }).select().single()
    if (data) setItems(prev => [...prev, data])
  }

  async function handleDeleteItem(itemId: string) {
    setItems(prev => prev.filter(i => i.id !== itemId))
    await supabase.from('items').delete().eq('id', itemId)
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    const maxPos = categories.length
    const { data } = await supabase
      .from('categories')
      .insert({
        name: newCatName.trim(),
        position: maxPos,
        journey_id: journeyId,
        traveler_id: travelerId,
        person: 'AILA', // legacy field, not used in new flow
      })
      .select().single()
    if (data) setCategories(prev => [...prev, data])
    setNewCatName('')
    setAddingCategory(false)
  }

  async function handleDeleteCategory(categoryId: string) {
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    setItems(prev => prev.filter(i => i.category_id !== categoryId))
    await supabase.from('categories').delete().eq('id', categoryId)
  }

  if (!ready) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // For master: group categories by traveler
  const getCategoryOwner = (cat: Category) => {
    if (!isMaster) return undefined
    const t = journeyTravelers.find(t => t.id === cat.traveler_id)
    return t ? `${statusLabel(t.status)} · ${t.nickname}` : undefined
  }

  const getVisibleItems = (categoryId: string) =>
    items.filter(item =>
      item.category_id === categoryId &&
      (bagFilter === 'ALL' || item.bag === bagFilter)
    )

  const visibleCategories = categories.filter(cat =>
    bagFilter === 'ALL' || items.some(i => i.category_id === cat.id && i.bag === bagFilter)
  )

  const allVisibleItems = visibleCategories.flatMap(cat => getVisibleItems(cat.id))
  const packed = allVisibleItems.filter(i => checked.has(i.id)).length
  const total = allVisibleItems.length
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0

  const q = searchQuery.trim().toLowerCase()
  const searchResults = q.length > 0
    ? items.filter(i => i.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  const getItemBagLabel = (item: Item): string => {
    if (!item.bag) return 'No bag assigned'
    return `${bagEmoji(item.bag)} ${item.bag}`
  }

  const getItemOwnerLabel = (item: Item): string | undefined => {
    if (!isMaster) return undefined
    const cat = categories.find(c => c.id === item.category_id)
    if (!cat) return undefined
    const t = journeyTravelers.find(t => t.id === cat.traveler_id)
    return t ? `${statusLabel(t.status)} · ${t.nickname}` : undefined
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-300 border-b border-slate-400 px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="text-slate-500 hover:text-slate-700 text-sm">←</button>
              <div>
                <h1 className="text-base font-bold text-slate-800">
                  {isMaster ? 'See All Bags' : `${travelerNickname}`}
                </h1>
                <p className="text-xs text-slate-500">{journeyName}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-500">{packed}/{total}</span>
          </div>

          {/* Progress */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-right text-xs font-bold mt-1 text-teal-600">{pct}%</p>

          {/* Bag filter */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(['ALL', ...bags]).map(b => (
              <button
                key={b}
                onClick={() => setBagFilter(b)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors border whitespace-normal break-words text-left max-w-[160px] ${
                  bagFilter === b ? 'bg-violet-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All bags' : b}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <p className="text-xs font-semibold text-slate-500 mb-1">Search your bags</p>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="type to find your..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-teal-400 transition-colors"
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {searchResults.map(item => (
                  <li key={item.id} className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700 truncate">{item.name}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                      {getItemOwnerLabel(item) && (
                        <span className="text-slate-500">{getItemOwnerLabel(item)} ·</span>
                      )}
                      {getItemBagLabel(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {q.length > 0 && searchResults.length === 0 && (
              <p className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 px-3 py-2 text-sm text-slate-400">
                No items found
              </p>
            )}
          </div>
        </header>

        {/* List */}
        <div className="px-4 pt-4 space-y-4">

          {/* Master: always group by bag */}
          {isMaster ? (() => {
            const filteredBags = bagFilter === 'ALL' ? bags : bags.filter(b => b === bagFilter)
            const bagSections = filteredBags.map(bagName => ({
              bagName,
              items: items.filter(i => i.bag === bagName),
            }))
            const unassigned = bagFilter === 'ALL' ? items.filter(i => !i.bag) : []
            const allSections = [
              ...bagSections,
              ...(unassigned.length > 0 ? [{ bagName: null, items: unassigned }] : []),
            ]

            if (allSections.every(s => s.items.length === 0)) return (
              <p className="text-center text-slate-400 text-sm py-8">No items yet.</p>
            )

            return allSections.filter(s => s.items.length > 0).map(({ bagName, items: bagItems }) => {
              const packedCount = bagItems.filter(i => checked.has(i.id)).length
              return (
                <div key={bagName ?? '__unassigned'} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">
                      {bagName ?? 'Unassigned'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{packedCount}/{bagItems.length}</span>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {bagItems.map(item => {
                      const cat = categories.find(c => c.id === item.category_id)
                      const traveler = journeyTravelers.find(t => t.id === cat?.traveler_id)
                      return (
                        <li
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            checked.has(item.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                          }`}>
                            {checked.has(item.id) && <span className="text-white text-[9px] font-bold">✓</span>}
                          </span>
                          <span className={`flex-1 text-sm transition-colors ${checked.has(item.id) ? 'line-through text-slate-300' : 'text-slate-700'}`}>
                            {item.name}
                          </span>
                          {traveler && (
                            <span className="text-xs text-slate-400 whitespace-nowrap">{traveler.nickname}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          })() : (
            <>
              {visibleCategories.length === 0 && !addingCategory && (
                <p className="text-center text-slate-400 text-sm py-8">
                  {bagFilter !== 'ALL' ? 'No items in this bag.' : 'No categories yet. Add one below.'}
                </p>
              )}
              {visibleCategories.map(cat => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  items={getVisibleItems(cat.id)}
                  checked={checked}
                  ownerLabel={getCategoryOwner(cat)}
                  bags={bags}
                  readOnly={isMaster}
                  onToggle={toggle}
                  onBagChange={handleBagChange}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                  onDeleteCategory={handleDeleteCategory}
                />
              ))}
            </>
          )}

          {/* Add category — only for individual traveler lists */}
          {!isMaster && (
            addingCategory ? (
              <form onSubmit={handleAddCategory} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex gap-2">
                <input
                  autoFocus
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Category name…"
                  className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-300"
                  onKeyDown={e => e.key === 'Escape' && setAddingCategory(false)}
                />
                <button type="submit" className="text-teal-500 text-sm font-semibold">Add</button>
                <button type="button" onClick={() => setAddingCategory(false)} className="text-slate-400 text-sm">Cancel</button>
              </form>
            ) : (
              <button
                onClick={() => setAddingCategory(true)}
                className="w-full py-3 text-sm text-teal-500 border border-dashed border-teal-200 rounded-2xl bg-white hover:bg-teal-50 transition-colors"
              >
                ＋ Add category
              </button>
            )
          )}

          {/* Reset */}
          <button
            onClick={async () => {
              const ids = allVisibleItems.map(i => i.id)
              const next = new Set(checked)
              ids.forEach(id => next.delete(id))
              setChecked(next)
              if (isGuest) {
                localStorage.setItem(LOCAL_CHECKED_KEY, JSON.stringify([...next]))
              } else {
                await supabase.from('checked_items').delete().eq('user_id', (user as User).id).in('item_id', ids)
              }
            }}
            className="w-full mb-6 py-3 text-sm text-red-400 border border-red-100 rounded-2xl bg-white hover:bg-red-50 transition-colors"
          >
            Reset visible items
          </button>
        </div>
      </div>
    </div>
  )
}
