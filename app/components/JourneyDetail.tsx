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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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

  const hasBaby = travelers.some(t => t.status === 'baby')

  const airlineLinks = segments.reduce<FlightSegment[]>((acc, s) => {
    if (!acc.find(a => a.airline === s.airline)) acc.push(s)
    return acc
  }, [])

  const masterPct = masterProgress.total > 0
    ? Math.round((masterProgress.packed / masterProgress.total) * 100)
    : 0

  return (
    <div className="flex-1 overflow-y-auto pb-nav-safe">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-lg p-2 -ml-2">← Back</button>
            <h2 className="text-lg font-bold text-slate-800">{journey.name}</h2>
          </div>
          <button onClick={onEdit} className="text-sm text-teal-500 hover:text-teal-700 font-medium transition-colors px-3 py-2 -mr-2">Edit</button>
        </div>

        {/* Flight itinerary */}
        {segments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Summary row — tap to expand */}
            <button
              onClick={() => setFlightExpanded(e => !e)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-base font-semibold text-slate-700">{airports}</p>
                {totalMins > 0 && (
                  <p className="text-sm text-slate-400">{formatDuration(totalMins)} total · {segments.length} flight{segments.length > 1 ? 's' : ''}</p>
                )}
              </div>
              <span className="text-sm text-slate-400 ml-2">{flightExpanded ? '▲' : '▼'}</span>
            </button>

            {flightExpanded && (
              <div className="border-t border-slate-100">

                {/* Per-segment rows */}
                {segments.map((seg, i) => {
                  const durationMins = minutesBetween(seg.departure_time, seg.arrival_time)
                  const layoverMins = i > 0 ? minutesBetween(segments[i - 1].arrival_time, seg.departure_time) : null
                  const isUS = US_AIRPORTS.has(seg.departure_airport)
                  const prevIsUS = i > 0 && US_AIRPORTS.has(segments[i - 1].departure_airport)
                  const needsImmigration = layoverMins !== null && isUS && !prevIsUS

                  return (
                    <div key={seg.id}>
                      {/* Layover badge between segments */}
                      {layoverMins !== null && (
                        <div className={`px-4 py-2 flex items-center gap-2 border-t border-slate-50 ${
                          layoverMins < 60 ? 'bg-red-50' : layoverMins < 90 ? 'bg-amber-50' : 'bg-slate-50'
                        }`}>
                          <span className={`text-xs font-semibold ${
                            layoverMins < 60 ? 'text-red-600' : layoverMins < 90 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            Layover {seg.departure_airport} · {formatDuration(layoverMins)}
                            {layoverMins < 60 && ' — Short, move fast!'}
                            {layoverMins >= 60 && layoverMins < 90 && ' — Tight connection'}
                          </span>
                          {needsImmigration && (
                            <span className="text-xs font-semibold text-blue-600 ml-1">· US Immigration required</span>
                          )}
                        </div>
                      )}

                      {/* Segment detail */}
                      <div className="px-4 py-3 border-t border-slate-50">
                        {/* Airline + flight number */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {seg.airline}{seg.flight_number ? ` · ${seg.flight_number}` : ''}
                          </span>
                          <span className="text-sm text-slate-400">{formatDuration(durationMins)}</span>
                        </div>

                        {/* Route + times */}
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{seg.departure_airport}</p>
                            <p className="text-base font-semibold text-slate-600">{formatTime(seg.departure_time)}</p>
                            <p className="text-xs text-slate-400">{formatDate(seg.departure_time)}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-1">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-slate-300 text-xs">✈</span>
                            <div className="flex-1 h-px bg-slate-200" />
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-slate-800">{seg.arrival_airport}</p>
                            <p className="text-base font-semibold text-slate-600">{formatTime(seg.arrival_time)}</p>
                            <p className="text-xs text-slate-400">{formatDate(seg.arrival_time)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Baggage links */}
                {(airlineLinks.some(s => s.baggage_url || s.infant_baggage_url) || journey.cdc_link) && (
                  <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-2">
                    {airlineLinks.map(s => (
                      <span key={s.airline} className="flex flex-wrap gap-3">
                        {s.baggage_url && (
                          <a href={s.baggage_url} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-teal-600 underline">
                            {s.airline} Baggage
                          </a>
                        )}
                        {hasBaby && s.infant_baggage_url && (
                          <a href={s.infant_baggage_url} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-pink-600 underline">
                            {s.airline} Infant Baggage
                          </a>
                        )}
                      </span>
                    ))}
                    {journey.cdc_link && (
                      <a href={journey.cdc_link} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-green-600 underline">
                        CDC Health Info
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Traveler baggage allowances */}
        {travelers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Baggage Allowance</p>
            {travelers.map(t => {
              const bags = travelerBags[t.id] ?? []
              return (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0 pt-0.5">
                    <StatusBadge status={t.status} />
                    <span className="text-sm font-medium text-slate-700 truncate">{t.nickname}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bags.length > 0
                      ? bags.map(b => (
                          <span key={b} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{b}</span>
                        ))
                      : <span className="text-xs text-slate-300">No bags assigned</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* See All Bags card */}
        <button
          onClick={() => onOpenPacking(null)}
          className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 text-left hover:border-teal-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-slate-800 text-base">See All Bags</p>
              <p className="text-sm text-slate-400">All travelers</p>
            </div>
            <span className="text-base font-semibold text-slate-500">{masterProgress.packed}/{masterProgress.total}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${masterPct}%` }} />
          </div>
          <p className="text-right text-sm font-bold text-teal-600 mt-1">{masterPct}%</p>
        </button>

        {/* Per-traveler packing cards */}
        {travelers.map(t => {
          const p = progress[t.id] ?? { packed: 0, total: 0 }
          const pct = p.total > 0 ? Math.round((p.packed / p.total) * 100) : 0
          return (
            <button
              key={t.id}
              onClick={() => onOpenPacking(t.id)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 text-left hover:border-teal-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <p className="font-semibold text-slate-800 text-base">{t.nickname}'s Bags</p>
                </div>
                <span className="text-base font-semibold text-slate-500">{p.packed}/{p.total}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-right text-sm font-bold text-teal-600 mt-1">{pct}%</p>
            </button>
          )
        })}

        {travelers.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4">No travelers assigned to this journey.</p>
        )}

      </div>
    </div>
  )
}
