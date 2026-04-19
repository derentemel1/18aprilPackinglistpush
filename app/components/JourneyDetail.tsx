'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Journey, FlightSegment, Traveler } from '../types'
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

interface Progress { packed: number; total: number }

interface Props {
  journey: Journey
  travelers: Traveler[]
  segments: FlightSegment[]
  travelerBags: Record<string, string[]>
  user: User | 'guest'
  onBack: () => void
  onEdit: () => void
  onOpenPacking: (travelerId: string | null) => void
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    baby:  'bg-rose-100 text-rose-500',
    minor: 'bg-sky-100 text-sky-500',
    adult: 'bg-teal-100 text-teal-600',
  }
  const labels: Record<string, string> = { baby: 'Baby', minor: 'Kid', adult: 'Adult' }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function JourneyDetail({ journey, travelers, segments, travelerBags, user, onBack, onEdit, onOpenPacking }: Props) {
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [masterProgress, setMasterProgress] = useState<Progress>({ packed: 0, total: 0 })
  const [flightExpanded, setFlightExpanded] = useState(false)

  useEffect(() => { loadProgress() }, [journey.id])

  async function loadProgress() {
    const { data: cats } = await supabase.from('categories').select('id, traveler_id').eq('journey_id', journey.id)
    if (!cats || cats.length === 0) return

    const catIds = cats.map(c => c.id)
    const { data: its } = await supabase.from('items').select('id, category_id').in('category_id', catIds)
    if (!its || its.length === 0) return

    let checkedIds = new Set<string>()
    if (user !== 'guest') {
      const { data: ci } = await supabase
        .from('checked_items').select('item_id')
        .eq('user_id', (user as User).id)
        .in('item_id', its.map(i => i.id))
      checkedIds = new Set(ci?.map(r => r.item_id) ?? [])
    }

    const prog: Record<string, Progress> = {}
    let masterPacked = 0, masterTotal = 0

    travelers.forEach(t => {
      const travelerCatIds = cats.filter(c => c.traveler_id === t.id).map(c => c.id)
      const travelerItems = its.filter(i => travelerCatIds.includes(i.category_id))
      const packed = travelerItems.filter(i => checkedIds.has(i.id)).length
      prog[t.id] = { packed, total: travelerItems.length }
      masterPacked += packed
      masterTotal += travelerItems.length
    })

    setProgress(prog)
    setMasterProgress({ packed: masterPacked, total: masterTotal })
  }

  const airports = segments.length > 0
    ? [segments[0].departure_airport, ...segments.map(s => s.arrival_airport)].join(' → ')
    : null

  const totalMins = segments.length > 0
    ? minutesBetween(segments[0].departure_time, segments[segments.length - 1].arrival_time)
    : 0

  const layovers = segments.slice(1).map((seg, i) => {
    const prev = segments[i]
    const mins = minutesBetween(prev.arrival_time, seg.departure_time)
    const isUS = US_AIRPORTS.has(seg.departure_airport)
    const prevIsUS = US_AIRPORTS.has(prev.departure_airport)
    return { airport: seg.departure_airport, mins, needsImmigration: isUS && !prevIsUS }
  })

  const hasBaby = travelers.some(t => t.status === 'baby')
  const airlineLinks = segments.reduce<FlightSegment[]>((acc, s) => {
    if (!acc.find(a => a.airline === s.airline)) acc.push(s)
    return acc
  }, [])

  const masterPct = masterProgress.total > 0
    ? Math.round((masterProgress.packed / masterProgress.total) * 100)
    : 0

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm">← Back</button>
            <h2 className="text-lg font-bold text-slate-800">{journey.name}</h2>
          </div>
          <button onClick={onEdit} className="text-sm text-teal-500 hover:text-teal-700 font-medium transition-colors">Edit</button>
        </div>

        {/* See All Bags card */}
        <button
          onClick={() => onOpenPacking(null)}
          className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 text-left hover:border-teal-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-slate-800 text-sm">See All Bags</p>
              <p className="text-xs text-slate-400">All travelers</p>
            </div>
            <span className="text-sm font-semibold text-slate-500">{masterProgress.packed}/{masterProgress.total}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${masterPct}%` }} />
          </div>
          <p className="text-right text-xs font-bold text-teal-600 mt-0.5">{masterPct}%</p>
        </button>

        {/* Per-traveler cards */}
        {travelers.map(t => {
          const p = progress[t.id] ?? { packed: 0, total: 0 }
          const pct = p.total > 0 ? Math.round((p.packed / p.total) * 100) : 0
          return (
            <button
              key={t.id}
              onClick={() => onOpenPacking(t.id)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 text-left hover:border-teal-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <p className="font-semibold text-slate-800 text-sm">{t.nickname}'s Bags</p>
                </div>
                <span className="text-sm font-semibold text-slate-500">{p.packed}/{p.total}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-right text-xs font-bold text-teal-600 mt-0.5">{pct}%</p>
            </button>
          )
        })}

        {travelers.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4">No travelers assigned to this journey.</p>
        )}

        {/* Flight info — compact summary, expandable */}
        {segments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setFlightExpanded(e => !e)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">{airports}</p>
                {totalMins > 0 && <p className="text-xs text-slate-400">{formatDuration(totalMins)} total travel time</p>}
              </div>
              <span className="text-xs text-slate-400 ml-2">{flightExpanded ? '▲' : '▼'}</span>
            </button>

            {flightExpanded && (
              <div className="px-4 pb-4 space-y-2 text-xs border-t border-slate-50 pt-3">
                {layovers.map((l, i) => (
                  <div key={i}>
                    <p className="text-slate-600">
                      Layover {l.airport}: {formatDuration(l.mins)}
                      {l.mins < 60 && <span className="ml-1 text-red-500 font-semibold">Short Layover — move fast!</span>}
                      {l.mins >= 60 && l.mins < 90 && <span className="ml-1 text-amber-500 font-semibold">Tight connection</span>}
                    </p>
                    {l.needsImmigration && <p className="text-blue-600 font-semibold">US Immigration Required</p>}
                  </div>
                ))}
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                  {airlineLinks.map(s => (
                    <span key={s.airline} className="flex gap-2">
                      {s.baggage_url && (
                        <a href={s.baggage_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">
                          {s.airline} Baggage
                        </a>
                      )}
                      {hasBaby && s.infant_baggage_url && (
                        <a href={s.infant_baggage_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">
                          {s.airline} Infant Baggage
                        </a>
                      )}
                    </span>
                  ))}
                  {journey.cdc_link && (
                    <a href={journey.cdc_link} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">
                      CDC
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
