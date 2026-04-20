'use client'

import { useState, useRef, useEffect } from 'react'
import { searchAirlines } from '../../lib/airlines'

interface Props {
  value: string
  onChange: (name: string) => void
  label?: string
}

export default function AirlineInput({ value, onChange, label }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = searchAirlines(query)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(name: string) {
    setQuery(name)
    onChange(name)
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>}
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Emirates"
        autoComplete="off"
        className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-teal-400 bg-slate-50"
      />

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
          {results.map(a => (
            <li key={a.iata}>
              <button
                type="button"
                onMouseDown={() => handleSelect(a.name)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
              >
                <span className="text-xs font-bold text-slate-400 w-8 flex-shrink-0">{a.iata}</span>
                <span className="text-sm font-medium text-slate-700 flex-1 truncate">{a.name}</span>
                <span className="text-xs text-slate-300 flex-shrink-0">{a.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
