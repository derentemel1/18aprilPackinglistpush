'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import JourneyDetail from '../JourneyDetail'
import PackingScreen from './PackingScreen'
import type { Journey, FlightSegment, Traveler, JourneyTravelerBag } from '../../types'
import { BAG_OPTIONS } from '../../types'
import type { User } from '@supabase/supabase-js'

const US_AIRPORTS = new Set([
  'JFK','LAX','ORD','ATL','DFW','DEN','SFO','SEA','MIA','BOS',
  'IAH','MCO','PHX','EWR','MSP','DTW','PHL','LGA','FLL','CLT',
  'IAD','SLC','BWI','SAN','MDW','HNL','TPA','PDX','STL','BNA',
])

function minutesBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000)
}

function formatDuration(minutes: number) {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function buildBagsMap(rows: JourneyTravelerBag[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  rows.forEach(r => {
    if (!map[r.traveler_id]) map[r.traveler_id] = []
    map[r.traveler_id].push(r.bag_type)
  })
  return map
}

interface SegmentDraft {
  tempId: string
  departure_airport: string; arrival_airport: string
  departure_time: string; arrival_time: string
  airline: string; flight_number: string
  baggage_url: string; infant_baggage_url: string
}

function emptySegment(): SegmentDraft {
  return {
    tempId: Math.random().toString(36).slice(2),
    departure_airport: '', arrival_airport: '',
    departure_time: '', arrival_time: '',
    airline: '', flight_number: '', baggage_url: '', infant_baggage_url: '',
  }
}

interface JourneyData {
  travelers: string[]
  segments: FlightSegment[]
  travelerBags: Record<string, string[]>
}

type View =
  | { type: 'list' }
  | { type: 'form'; editingId: string | null }
  | { type: 'detail'; journeyId: string }
  | { type: 'packing'; journeyId: string; travelerId: string | null }

export default function JourneysScreen({ user }: { user: User | 'guest' }) {
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [journeyData, setJourneyData] = useState<Record<string, JourneyData>>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ type: 'list' })
  const [saving, setSaving] = useState(false)

  // Inline traveler form state
  const [showTravelerForm, setShowTravelerForm] = useState(false)
  const [travelerNickname, setTravelerNickname] = useState('')
  const [travelerStatus, setTravelerStatus] = useState<'baby' | 'minor' | 'adult'>('adult')
  const [savingTraveler, setSavingTraveler] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formCdcLink, setFormCdcLink] = useState('')
  const [formTravelerIds, setFormTravelerIds] = useState<string[]>([])
  const [formTravelerBags, setFormTravelerBags] = useState<Record<string, string[]>>({})
  const [formSegments, setFormSegments] = useState<SegmentDraft[]>([emptySegment()])

  useEffect(() => {
    if (user === 'guest') { setLoading(false); return }
    loadAll()
  }, [user])

  async function loadAll() {
    const uid = (user as User).id
    const [{ data: js }, { data: ts }] = await Promise.all([
      supabase.from('journeys').select('*').eq('owner_id', uid).order('created_at', { ascending: false }),
      supabase.from('travelers').select('*').eq('user_id', uid).order('position'),
    ])
    setJourneys(js ?? [])
    setTravelers(ts ?? [])

    if (js && js.length > 0) {
      const ids = js.map(j => j.id)
      const [{ data: jt }, { data: segs }, { data: jtb }] = await Promise.all([
        supabase.from('journey_travelers').select('*').in('journey_id', ids),
        supabase.from('flight_segments').select('*').in('journey_id', ids).order('position'),
        supabase.from('journey_traveler_bags').select('*').in('journey_id', ids),
      ])
      const data: Record<string, JourneyData> = {}
      ids.forEach(id => {
        data[id] = {
          travelers: jt?.filter(r => r.journey_id === id).map(r => r.traveler_id) ?? [],
          segments: segs?.filter(s => s.journey_id === id) ?? [],
          travelerBags: buildBagsMap(jtb?.filter(b => b.journey_id === id) ?? []),
        }
      })
      setJourneyData(data)
    }
    setLoading(false)
  }

  function openAdd() {
    setFormName(''); setFormCdcLink('')
    setFormTravelerIds([]); setFormTravelerBags({})
    setFormSegments([emptySegment()])
    setView({ type: 'form', editingId: null })
  }

  function openEdit(j: Journey) {
    const data = journeyData[j.id]
    setFormName(j.name); setFormCdcLink(j.cdc_link ?? '')
    setFormTravelerIds(data?.travelers ?? [])
    setFormTravelerBags(data?.travelerBags ?? {})
    setFormSegments(
      data?.segments.length
        ? data.segments.map(s => ({
            tempId: s.id,
            departure_airport: s.departure_airport, arrival_airport: s.arrival_airport,
            departure_time: s.departure_time.slice(0, 16), arrival_time: s.arrival_time.slice(0, 16),
            airline: s.airline, flight_number: s.flight_number ?? '',
            baggage_url: s.baggage_url ?? '', infant_baggage_url: s.infant_baggage_url ?? '',
          }))
        : [emptySegment()]
    )
    setView({ type: 'form', editingId: j.id })
  }

  function toggleTraveler(tid: string) {
    setFormTravelerIds(prev => {
      if (prev.includes(tid)) {
        // Remove traveler and their bags
        setFormTravelerBags(b => { const next = { ...b }; delete next[tid]; return next })
        return prev.filter(x => x !== tid)
      }
      return [...prev, tid]
    })
  }

  function toggleBag(tid: string, bag: string) {
    setFormTravelerBags(prev => {
      const current = prev[tid] ?? []
      return {
        ...prev,
        [tid]: current.includes(bag) ? current.filter(b => b !== bag) : [...current, bag],
      }
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || user === 'guest') return
    setSaving(true)
    const uid = (user as User).id
    const editingId = view.type === 'form' ? view.editingId : null
    const validSegs = formSegments.filter(s =>
      s.departure_airport && s.arrival_airport && s.departure_time && s.arrival_time && s.airline
    )

    try {
      let journeyId = editingId
      if (editingId) {
        await supabase.from('journeys').update({ name: formName.trim(), cdc_link: formCdcLink || null }).eq('id', editingId)
        await Promise.all([
          supabase.from('journey_travelers').delete().eq('journey_id', editingId),
          supabase.from('flight_segments').delete().eq('journey_id', editingId),
          supabase.from('journey_traveler_bags').delete().eq('journey_id', editingId),
        ])
      } else {
        const { data: newJ } = await supabase
          .from('journeys').insert({ name: formName.trim(), cdc_link: formCdcLink || null, owner_id: uid })
          .select().single()
        if (!newJ) return
        journeyId = newJ.id
      }

      const ops: Promise<any>[] = []

      if (formTravelerIds.length > 0) {
        ops.push(supabase.from('journey_travelers').insert(
          formTravelerIds.map(tid => ({ journey_id: journeyId, traveler_id: tid }))
        ))
      }

      const bagRows = Object.entries(formTravelerBags).flatMap(([tid, bags]) =>
        bags.map(bag => ({ journey_id: journeyId, traveler_id: tid, bag_type: bag }))
      )
      if (bagRows.length > 0) {
        ops.push(supabase.from('journey_traveler_bags').insert(bagRows))
      }

      if (validSegs.length > 0) {
        ops.push(supabase.from('flight_segments').insert(
          validSegs.map((s, i) => ({
            journey_id: journeyId, position: i,
            departure_airport: s.departure_airport.toUpperCase(),
            arrival_airport: s.arrival_airport.toUpperCase(),
            departure_time: s.departure_time, arrival_time: s.arrival_time,
            airline: s.airline, flight_number: s.flight_number || null,
            baggage_url: s.baggage_url || null, infant_baggage_url: s.infant_baggage_url || null,
          }))
        ))
      }

      await Promise.all(ops)
      await loadAll()
      setView({ type: 'list' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setJourneys(prev => prev.filter(j => j.id !== id))
    await supabase.from('journeys').delete().eq('id', id)
  }

  async function handleAddTraveler(e: React.FormEvent) {
    e.preventDefault()
    if (!travelerNickname.trim() || user === 'guest') return
    setSavingTraveler(true)
    const { data } = await supabase.from('travelers').insert({
      nickname: travelerNickname.trim(),
      status: travelerStatus,
      emoji: '🙂',
      position: travelers.length,
      user_id: (user as User).id,
    }).select().single()
    if (data) {
      setTravelers(prev => [...prev, data])
      setFormTravelerIds(prev => [...prev, data.id])
    }
    setTravelerNickname('')
    setTravelerStatus('adult')
    setShowTravelerForm(false)
    setSavingTraveler(false)
  }

  function updateSegment(tempId: string, field: keyof SegmentDraft, value: string) {
    setFormSegments(prev => prev.map(s => s.tempId === tempId ? { ...s, [field]: value } : s))
  }

  const hasBabyInForm = formTravelerIds.some(id => travelers.find(t => t.id === id)?.status === 'baby')

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user === 'guest') return (
    <div className="flex-1 flex items-center justify-center px-6 text-center">
      <p className="text-slate-500 text-sm">Log in to manage journeys</p>
    </div>
  )

  // ── Packing view ───────────────────────────────────────────────────────────
  if (view.type === 'packing') {
    const journey = journeys.find(j => j.id === view.journeyId)!
    const data = journeyData[view.journeyId] ?? { travelers: [], segments: [], travelerBags: {} }
    const assignedTravelers = data.travelers.map(id => travelers.find(t => t.id === id)).filter(Boolean) as Traveler[]
    const traveler = view.travelerId ? travelers.find(t => t.id === view.travelerId) : null

    return (
      <PackingScreen
        user={user}
        journeyId={view.journeyId}
        journeyName={journey.name}
        travelerId={view.travelerId}
        travelerEmoji={traveler?.emoji}
        travelerNickname={traveler?.nickname}
        journeyTravelers={assignedTravelers}
        travelerBags={data.travelerBags}
        onBack={() => setView({ type: 'detail', journeyId: view.journeyId })}
      />
    )
  }

  // ── Detail view ────────────────────────────────────────────────────────────
  if (view.type === 'detail') {
    const journey = journeys.find(j => j.id === view.journeyId)!
    const data = journeyData[view.journeyId] ?? { travelers: [], segments: [], travelerBags: {} }
    const assignedTravelers = data.travelers.map(id => travelers.find(t => t.id === id)).filter(Boolean) as Traveler[]

    return (
      <JourneyDetail
        journey={journey}
        travelers={assignedTravelers}
        segments={data.segments}
        travelerBags={data.travelerBags}
        user={user}
        onBack={() => setView({ type: 'list' })}
        onEdit={() => openEdit(journey)}
        onOpenPacking={(travelerId) => setView({ type: 'packing', journeyId: view.journeyId, travelerId })}
      />
    )
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  if (view.type === 'form') return (
    <div className="flex-1 overflow-y-auto pb-nav-safe">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView({ type: 'list' })} className="text-slate-400 hover:text-slate-600 text-lg p-2 -ml-2">← Back</button>
          <h2 className="text-lg font-bold text-slate-800">{view.editingId ? 'Edit Journey' : 'New Journey'}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Details</p>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Journey name</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Vietnam 2026" required
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">CDC destination page (optional)</label>
              <input value={formCdcLink} onChange={e => setFormCdcLink(e.target.value)} placeholder="https://wwwnc.cdc.gov/travel/..." type="url"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
            </div>
          </div>

          {/* Travelers + bag allowance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Travelers & Baggage</p>

            {travelers.map(t => {
              const selected = formTravelerIds.includes(t.id)
              const availableBags = BAG_OPTIONS.filter(b => b !== 'Diaper Bag' || t.status === 'baby')
              const selectedBags = formTravelerBags[t.id] ?? []
              const badgeStyle = t.status === 'baby' ? 'bg-rose-100 text-rose-500' : t.status === 'minor' ? 'bg-sky-100 text-sky-500' : 'bg-teal-100 text-teal-600'
              const badgeLabel = t.status === 'baby' ? 'Baby' : t.status === 'minor' ? 'Kid' : 'Adult'

              return (
                <div key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggleTraveler(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
                      selected ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}>{badgeLabel}</span>
                    <span className="text-sm font-medium text-slate-700">{t.nickname}</span>
                    {selected && <span className="ml-auto text-teal-500">✓</span>}
                  </button>

                  {selected && (
                    <div className="mt-2 ml-3 pl-3 border-l-2 border-teal-200">
                      <p className="text-xs text-slate-500 mb-1.5">{t.nickname}'s baggage allowance</p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableBags.map(bag => (
                          <button key={bag} type="button" onClick={() => toggleBag(t.id, bag)}
                            className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                              selectedBags.includes(bag) ? 'bg-teal-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}>
                            {bag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {showTravelerForm ? (
              <form onSubmit={handleAddTraveler} className="border border-slate-200 rounded-xl px-3 py-3 space-y-3 bg-slate-50">
                <input
                  autoFocus
                  value={travelerNickname}
                  onChange={e => setTravelerNickname(e.target.value)}
                  placeholder="Nickname (e.g. Ayla, Dad)"
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-white"
                />
                <div className="flex gap-2">
                  {(['baby', 'minor', 'adult'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setTravelerStatus(s)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                        travelerStatus === s ? 'bg-teal-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                      {s === 'baby' ? 'Baby' : s === 'minor' ? 'Kid' : 'Adult'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={savingTraveler}
                    className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-semibold disabled:opacity-40">
                    {savingTraveler ? 'Adding…' : 'Add traveler'}
                  </button>
                  <button type="button" onClick={() => { setShowTravelerForm(false); setTravelerNickname('') }}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button type="button" onClick={() => setShowTravelerForm(true)}
                className="w-full py-4 text-sm text-teal-500 border border-dashed border-teal-200 rounded-xl bg-white hover:bg-teal-50 transition-colors">
                ＋ New traveler
              </button>
            )}
          </div>

          {/* Flight segments */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">Flight Segments</p>
            <p className="text-xs text-slate-400 px-1">Enter times in local airport time.</p>

            {formSegments.map((seg, i) => (
              <div key={seg.tempId} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Segment {i + 1}</p>
                  {formSegments.length > 1 && (
                    <button type="button" onClick={() => setFormSegments(prev => prev.filter(s => s.tempId !== seg.tempId))}
                      className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([['From (IATA)', 'departure_airport', 'SGN'], ['To (IATA)', 'arrival_airport', 'DXB']] as const).map(([label, field, ph]) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <input value={seg[field]} onChange={e => updateSegment(seg.tempId, field, e.target.value)}
                        placeholder={ph} maxLength={3}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50 uppercase" />
                    </div>
                  ))}
                  {([['Departs', 'departure_time'], ['Arrives', 'arrival_time']] as const).map(([label, field]) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                      <input type="datetime-local" value={seg[field]} onChange={e => updateSegment(seg.tempId, field, e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Airline</label>
                    <input value={seg.airline} onChange={e => updateSegment(seg.tempId, 'airline', e.target.value)} placeholder="Emirates"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Flight # (optional)</label>
                    <input value={seg.flight_number} onChange={e => updateSegment(seg.tempId, 'flight_number', e.target.value)} placeholder="EK392"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Baggage policy URL (optional)</label>
                  <input value={seg.baggage_url} onChange={e => updateSegment(seg.tempId, 'baggage_url', e.target.value)} placeholder="https://..." type="url"
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
                </div>
                {hasBabyInForm && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Infant baggage policy URL (optional)</label>
                    <input value={seg.infant_baggage_url} onChange={e => updateSegment(seg.tempId, 'infant_baggage_url', e.target.value)} placeholder="https://..." type="url"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50" />
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={() => setFormSegments(prev => [...prev, emptySegment()])}
              className="w-full py-4 text-sm text-teal-500 border border-dashed border-teal-200 rounded-2xl bg-white hover:bg-teal-50 transition-colors">
              ＋ Add flight segment
            </button>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 rounded-2xl bg-teal-500 text-white font-semibold text-base hover:bg-teal-600 disabled:opacity-40 transition-colors">
            {saving ? 'Saving…' : view.editingId ? 'Save changes' : 'Create journey'}
          </button>
        </form>
      </div>
    </div>
  )

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto pb-nav-safe">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Journeys</h2>

        {journeys.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">No journeys yet.</p>
        )}

        {journeys.map(j => {
          const data = journeyData[j.id] ?? { travelers: [], segments: [], travelerBags: {} }
          const segs = data.segments
          const assigned = data.travelers.map(id => travelers.find(t => t.id === id)).filter(Boolean) as Traveler[]
          const airports = segs.length > 0 ? [segs[0].departure_airport, ...segs.map(s => s.arrival_airport)].join(' → ') : null
          const totalMins = segs.length > 0 ? minutesBetween(segs[0].departure_time, segs[segs.length - 1].arrival_time) : 0

          return (
            <button key={j.id} onClick={() => setView({ type: 'detail', journeyId: j.id })}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left hover:border-teal-300 transition-colors">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{j.name}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">{assigned.map(t => {
                    const s = t.status === 'baby' ? 'bg-rose-100 text-rose-500' : t.status === 'minor' ? 'bg-sky-100 text-sky-500' : 'bg-teal-100 text-teal-600'
                    const l = t.status === 'baby' ? 'Baby' : t.status === 'minor' ? 'Kid' : 'Adult'
                    return <span key={t.id} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s}`}>{l} · {t.nickname}</span>
                  })}</div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(j)} className="text-slate-400 hover:text-teal-500 text-sm px-3 py-3 -my-3">Edit</button>
                  <button onClick={() => handleDelete(j.id)} className="text-slate-300 hover:text-red-400 text-xl leading-none p-2 -mr-1">×</button>
                </div>
              </div>
              {airports && (
                <div className="px-4 py-2 text-xs text-slate-500">
                  <p>{airports}{totalMins > 0 ? ` · ${formatDuration(totalMins)}` : ''}</p>
                </div>
              )}
            </button>
          )
        })}

        <button onClick={openAdd}
          className="w-full py-4 text-sm text-teal-500 border border-dashed border-teal-200 rounded-2xl bg-white hover:bg-teal-50 transition-colors">
          ＋ New journey
        </button>
      </div>
    </div>
  )
}
