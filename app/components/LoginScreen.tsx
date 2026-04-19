'use client'

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'

const PIN_LENGTH = 4

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  async function submit(pin: string) {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        localStorage.setItem('packing-auth', '1')
        onSuccess()
      } else {
        setDigits(Array(PIN_LENGTH).fill(''))
        setError(true)
        setShake(true)
        setTimeout(() => setShake(false), 500)
        inputs.current[0]?.focus()
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError(false)

    if (value && index < PIN_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }

    if (value && index === PIN_LENGTH - 1) {
      const pin = [...next.slice(0, PIN_LENGTH - 1), value].join('')
      if (pin.length === PIN_LENGTH) submit(pin)
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (!pasted) return
    const next = Array(PIN_LENGTH).fill('')
    pasted.split('').forEach((d, i) => (next[i] = d))
    setDigits(next)
    inputs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus()
    if (pasted.length === PIN_LENGTH) submit(pasted)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      {/* Card */}
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        {/* Top banner */}
        <div className="bg-teal-500 px-6 pt-8 pb-6 text-center">
          <div className="text-5xl mb-2">✈️</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vietnam 2026</h1>
          <p className="text-teal-100 text-sm mt-1">Family Packing List</p>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-center">
          <p className="text-slate-500 text-sm mb-6">
            Enter your PIN to start packing
          </p>

          {/* PIN boxes */}
          <div className="flex justify-center gap-3 mb-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoFocus={i === 0}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-colors bg-slate-50
                  ${error
                    ? 'border-red-400 bg-red-50 text-red-500'
                    : d
                      ? 'border-teal-400 text-teal-700'
                      : 'border-slate-200 text-slate-800 focus:border-teal-400'
                  }`}
              />
            ))}
          </div>

          {/* Error message */}
          <p className={`text-red-400 text-sm mb-4 transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}>
            Wrong PIN — try again
          </p>

          {/* Submit button */}
          <button
            onClick={() => submit(digits.join(''))}
            disabled={digits.join('').length < PIN_LENGTH || loading}
            className="w-full py-3.5 rounded-2xl bg-teal-500 text-white font-semibold text-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-teal-600 active:bg-teal-700 transition-colors"
          >
            {loading ? 'Checking…' : "Let's Pack! 🧳"}
          </button>
        </div>
      </div>

      <p className="text-slate-300 text-xs mt-6">April 2026 · Ho Chi Minh City</p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  )
}
