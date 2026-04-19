'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import EmojiPicker from '../EmojiPicker'
import type { Traveler, TravelerStatus } from '../../types'
import type { User } from '@supabase/supabase-js'

const STATUS_LABEL: Record<TravelerStatus, string> = {
  baby: '👶 Baby',
  minor: '🧒 Minor',
  adult: '🙋 Grown-up',
}

const STATUS_COLOR: Record<TravelerStatus, string> = {
  baby: 'bg-pink-100 text-pink-700',
  minor: 'bg-blue-100 text-blue-700',
  adult: 'bg-teal-100 text-teal-700',
}

interface FormState {
  emoji: string
  nickname: string
  status: TravelerStatus
}

const EMPTY_FORM: FormState = { emoji: '🙂', nickname: '', status: 'adult' }

export default function TravelersScreen({ user }: { user: User | 'guest' }) {
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user === 'guest') { setLoading(false); return }
    supabase
      .from('travelers')
      .select('*')
      .order('position')
      .then(({ data }) => {
        setTravelers(data ?? [])
        setLoading(false)
      })
  }, [user])

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(t: Traveler) {
    setForm({ emoji: t.emoji, nickname: t.nickname, status: t.status })
    setEditingId(t.id)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nickname.trim() || user === 'guest') return

    if (editingId) {
      const { data } = await supabase
        .from('travelers')
        .update({ emoji: form.emoji, nickname: form.nickname.trim(), status: form.status })
        .eq('id', editingId)
        .select()
        .single()
      if (data) setTravelers(prev => prev.map(t => t.id === editingId ? data : t))
    } else {
      const { data } = await supabase
        .from('travelers')
        .insert({
          emoji: form.emoji,
          nickname: form.nickname.trim(),
          status: form.status,
          position: travelers.length,
          user_id: (user as User).id,
        })
        .select()
        .single()
      if (data) setTravelers(prev => [...prev, data])
    }
    cancelForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this traveler?')) return
    setTravelers(prev => prev.filter(t => t.id !== id))
    await supabase.from('travelers').delete().eq('id', id)
  }

  if (loading) return (
    <div className="flex items-center justify-center flex-1">
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user === 'guest') return (
    <div className="flex-1 flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-4xl mb-3">👤</p>
        <p className="text-slate-500 text-sm">Log in to manage travelers</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Travelers</h2>

        {travelers.length === 0 && !showForm && (
          <p className="text-center text-slate-400 text-sm py-8">No travelers yet. Add one below.</p>
        )}

        {travelers.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <span className="text-3xl">{t.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{t.nickname}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status]}`}>
                {STATUS_LABEL[t.status]}
              </span>
            </div>
            <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-teal-500 text-sm transition-colors">Edit</button>
            <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-400 text-xl leading-none transition-colors">×</button>
          </div>
        ))}

        {showForm ? (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 space-y-4">
            <p className="font-semibold text-slate-700">{editingId ? 'Edit traveler' : 'New traveler'}</p>

            {/* Emoji picker */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Pick an emoji</label>
              <div className="text-4xl text-center mb-2">{form.emoji}</div>
              <EmojiPicker value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e }))} />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nickname</label>
              <input
                autoFocus
                value={form.nickname}
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                placeholder="e.g. Ayla, Dad, Baby Mia"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 bg-slate-50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Status</label>
              <div className="flex gap-2">
                {(['baby', 'minor', 'adult'] as TravelerStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      form.status === s
                        ? 'bg-teal-500 text-white border-transparent'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold">
                {editingId ? 'Save changes' : 'Add traveler'}
              </button>
              <button type="button" onClick={cancelForm} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={openAdd}
            className="w-full py-3 text-sm text-teal-500 border border-dashed border-teal-200 rounded-2xl bg-white hover:bg-teal-50 transition-colors"
          >
            ＋ Add traveler
          </button>
        )}
      </div>
    </div>
  )
}
