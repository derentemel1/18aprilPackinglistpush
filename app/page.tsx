'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import AuthScreen from './components/AuthScreen'
import CategorySection from './components/CategorySection'
import type { User } from '@supabase/supabase-js'
import type { Category, Item, Bag, PersonFilter, BagFilter } from './types'

const BAGS: Bag[] = ['Luggage A', 'Luggage B', 'Carry-On', 'Personal Item']
const BAG_EMOJI: Record<Bag, string> = {
  'Luggage A': '🧳',
  'Luggage B': '🧳',
  'Carry-On': '✈️',
  'Personal Item': '👜',
}
const LOCAL_CHECKED_KEY = 'packing-checked-v2'
const LOCAL_AUTH_KEY = 'packing-guest'

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [personFilter, setPersonFilter] = useState<PersonFilter>('AILA')
  const [bagFilter, setBagFilter] = useState<BagFilter>('ALL')
  const [user, setUser] = useState<User | null | 'guest'>(null)
  const [ready, setReady] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
      } else {
        const wasGuest = localStorage.getItem(LOCAL_AUTH_KEY) === '1'
        setUser(wasGuest ? 'guest' : null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data
  const loadData = useCallback(async () => {
    if (user === null) return

    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('categories').select('*').order('position'),
      supabase.from('items').select('*').order('position'),
    ])

    setCategories(cats ?? [])
    setItems(its ?? [])

    if (user === 'guest') {
      try {
        const raw = localStorage.getItem(LOCAL_CHECKED_KEY)
        if (raw) setChecked(new Set(JSON.parse(raw)))
      } catch {}
    } else {
      const { data } = await supabase
        .from('checked_items')
        .select('item_id')
        .eq('user_id', (user as User).id)
      setChecked(new Set(data?.map(r => r.item_id) ?? []))
    }

    setReady(true)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  // Toggle checked
  async function toggle(itemId: string) {
    const next = new Set(checked)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    setChecked(next)

    if (user === 'guest' || user === null) {
      try { localStorage.setItem(LOCAL_CHECKED_KEY, JSON.stringify([...next])) } catch {}
      return
    }

    if (next.has(itemId)) {
      await supabase.from('checked_items').upsert({ user_id: (user as User).id, item_id: itemId })
    } else {
      await supabase.from('checked_items').delete().eq('user_id', (user as User).id).eq('item_id', itemId)
    }
  }

  // Bag assignment
  async function handleBagChange(itemId: string, bag: Bag | null) {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, bag } : it))
    await supabase.from('items').update({ bag }).eq('id', itemId)
  }

  // Add item
  async function handleAddItem(categoryId: string, name: string) {
    const maxPos = items.filter(i => i.category_id === categoryId).length
    const { data } = await supabase
      .from('items')
      .insert({ category_id: categoryId, name, position: maxPos })
      .select()
      .single()
    if (data) setItems(prev => [...prev, data])
  }

  // Delete item
  async function handleDeleteItem(itemId: string) {
    if (!confirm('Delete this item?')) return
    setItems(prev => prev.filter(i => i.id !== itemId))
    await supabase.from('items').delete().eq('id', itemId)
  }

  // Add category
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim() || personFilter === 'ALL') return
    const maxPos = categories.filter(c => c.person === personFilter).length
    const { data } = await supabase
      .from('categories')
      .insert({ person: personFilter, name: newCatName.trim(), position: maxPos })
      .select()
      .single()
    if (data) setCategories(prev => [...prev, data])
    setNewCatName('')
    setAddingCategory(false)
  }

  // Delete category
  async function handleDeleteCategory(categoryId: string) {
    if (!confirm('Delete this category and all its items?')) return
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    setItems(prev => prev.filter(i => i.category_id !== categoryId))
    await supabase.from('categories').delete().eq('id', categoryId)
  }

  // Auth handlers
  function handleAuthSuccess() {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
      } else {
        localStorage.setItem(LOCAL_AUTH_KEY, '1')
        setUser('guest')
      }
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    localStorage.removeItem(LOCAL_AUTH_KEY)
    setUser(null)
    setCategories([])
    setItems([])
    setChecked(new Set())
    setReady(false)
  }

  if (user === null) return <AuthScreen onSuccess={handleAuthSuccess} />

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isGuest = user === 'guest'

  // Filter logic
  const visibleCategories = categories.filter(cat => {
    if (personFilter !== 'ALL' && cat.person !== personFilter) return false
    if (bagFilter !== 'ALL') {
      return items.some(item => item.category_id === cat.id && item.bag === bagFilter)
    }
    return true
  })

  const getVisibleItems = (categoryId: string) =>
    items.filter(item =>
      item.category_id === categoryId &&
      (bagFilter === 'ALL' || item.bag === bagFilter)
    )

  const allVisibleItems = visibleCategories.flatMap(cat => getVisibleItems(cat.id))
  const packed = allVisibleItems.filter(item => checked.has(item.id)).length
  const total = allVisibleItems.length
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0

  // Show person label in category header when viewing all people filtered by bag
  const showPerson = personFilter === 'ALL' && bagFilter !== 'ALL'

  return (
    <main className="min-h-screen pb-10 max-w-lg mx-auto">
      <header className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 pt-5 pb-3">
        {/* Title */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">✈️ Vietnam Packing</h1>
            <p className="text-xs text-slate-400 mt-0.5">April 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">{packed}/{total}</span>
            <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              {isGuest ? 'Log in' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-xs font-bold mt-1 text-teal-600">{pct}%</p>

        {/* Person filter */}
        <div className="flex gap-2 mt-3">
          {(['AILA', 'TRINH', 'ALL'] as PersonFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPersonFilter(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                personFilter === p
                  ? 'bg-teal-500 text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {p === 'AILA' ? '🧒 Aila' : p === 'TRINH' ? '👩 Trinh' : '👨‍👩‍👧 All'}
            </button>
          ))}
        </div>

        {/* Bag filter */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {(['ALL', ...BAGS] as BagFilter[]).map(b => (
            <button
              key={b}
              onClick={() => setBagFilter(b)}
              className={`flex-shrink-0 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                bagFilter === b
                  ? 'bg-violet-500 text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {b === 'ALL' ? '🗂 All bags' : `${BAG_EMOJI[b as Bag]} ${b}`}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="px-4 pt-4 space-y-4">
        {visibleCategories.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            {bagFilter !== 'ALL' ? 'No items assigned to this bag yet.' : 'No items found.'}
          </p>
        )}

        {visibleCategories.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            items={getVisibleItems(cat.id)}
            checked={checked}
            showPerson={showPerson}
            isGuest={isGuest}
            onToggle={toggle}
            onBagChange={handleBagChange}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onDeleteCategory={handleDeleteCategory}
          />
        ))}

        {/* Add category — only when viewing a specific person and all bags */}
        {!isGuest && personFilter !== 'ALL' && bagFilter === 'ALL' && (
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
    </main>
  )
}
