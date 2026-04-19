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

const LOCAL_CHECKED_KEY = 'packing-checked-v2'

function bagEmoji(bag: string) {
  if (bag.startsWith('Luggage')) return '🧳'
  if (bag.startsWith('Carry')) return '✈️'
  return '👜'
}

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

  const isMaster = travelerId === null
  const isGuest = user === 'guest'
  const bags = namedBags(travelerId, travelerNickname, journeyTravelers, travelerBags)

  const loadData = useCallback(async () => {
    setReady(false)
    let catQuery = supabase.from('categories').select('*').eq('journey_id', journeyId)
    if (!isMaster) catQuery = catQuery.eq('traveler_id', travelerId)

    const { data: cats } = await catQuery.order('position')
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
  }, [journeyId, travelerId, isMaster, isGuest, user])

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
    await supabase.from('items').update({ bag }).eq('id', itemId)
  }

  async function handleAddItem(categoryId: string, name: string) {
    const maxPos = items.filter(i => i.category_id === categoryId).length
    const { data } = await supabase
      .from('items').insert({ category_id: categoryId, name, position: maxPos }).select().single()
    if (data) setItems(prev => [...prev, data])
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm('Delete this item?')) return
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
    if (!confirm('Delete this category and all its items?')) return
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
    return t ? `${t.emoji} ${t.nickname}` : undefined
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
                  {isMaster ? '📋 Master List' : `${travelerEmoji} ${travelerNickname}`}
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
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                  bagFilter === b ? 'bg-violet-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {b === 'ALL' ? '🗂 All bags' : `${bagEmoji(b)} ${b}`}
              </button>
            ))}
          </div>
        </header>

        {/* List */}
        <div className="px-4 pt-4 space-y-4">
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
              if (!confirm('Reset all visible items?')) return
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
