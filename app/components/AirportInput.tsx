'use client'

import { useState, useRef, useEffect } from 'react'
import { searchAirports } from '../../lib/airports'

interface Props {
  value: string
  onChange: (iata: string) => void
  placeholder?: string
  label?: string
}

export default function AirportInput({ value, onChange, placeholder = 'e.g. SGN', label }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = searchAirports(query)

  // Sync if parent resets value
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(iata: string) {
    setQuery(iata)
    onChange(iata)
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.toUpperCase().slice(0, 6)
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  // Selected airport full name for display below input
  const selected = value.length === 3
    ? searchAirports(value, 1).find(a => a.iata === value.toUpperCase())
    : null

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>}
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base font-semibold uppercase outline-none focus:border-teal-400 bg-slate-50 tracking-widest"
      />
      {selected && (
        <p className="text-xs text-slate-400 mt-1 truncate">{selected.city} · {selected.name}</p>
      )}

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
          {results.map(a => (
            <li key={a.iata}>
              <button
                type="button"
                onMouseDown={() => handleSelect(a.iata)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
              >
                <span className="text-base font-bold text-slate-800 w-10 flex-shrink-0">{a.iata}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{a.city}</p>
                  <p className="text-xs text-slate-400 truncate">{a.name}</p>
                </div>
                <span className="text-xs text-slate-300 flex-shrink-0 ml-auto">{a.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
