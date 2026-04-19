'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Mode = 'login' | 'signup'

export default function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Top banner */}
        <div className="bg-teal-500 px-6 pt-8 pb-6 text-center">
          <img src="/logo.png" alt="App logo" className="w-48 h-48 mx-auto rounded-2xl object-cover" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['login', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage('') }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? 'text-teal-600 border-b-2 border-teal-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 transition-colors bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 transition-colors bg-slate-50"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-teal-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-teal-500 text-white font-semibold text-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-teal-600 active:bg-teal-700 transition-colors"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in 🧳' : 'Create account'}
          </button>
        </form>

        {/* Guest */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <button
            onClick={onSuccess}
            className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Continue as guest
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Guest progress is saved on this device only
          </p>
        </div>
      </div>

      <p className="text-slate-300 text-xs mt-6">April 2026 · Ho Chi Minh City</p>
    </div>
  )
}
