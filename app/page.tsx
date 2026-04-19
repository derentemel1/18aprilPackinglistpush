'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AuthScreen from './components/AuthScreen'
import PackingScreen from './components/screens/PackingScreen'
import TravelersScreen from './components/screens/TravelersScreen'
import JourneysScreen from './components/screens/JourneysScreen'
import type { User } from '@supabase/supabase-js'
import type { AppTab } from './types'

const LOCAL_AUTH_KEY = 'packing-guest'

export default function Page() {
  const [user, setUser] = useState<User | null | 'guest'>(null)
  const [tab, setTab] = useState<AppTab>('packing')

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
  }

  if (user === null) return <AuthScreen onSuccess={handleAuthSuccess} />

  return (
    <div className="min-h-screen flex flex-col">
      {/* Active screen */}
      {tab === 'packing' && <PackingScreen user={user} onSignOut={handleSignOut} />}
      {tab === 'travelers' && <TravelersScreen user={user} />}
      {tab === 'journeys' && <JourneysScreen user={user} />}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-20">
        {([
          { id: 'packing', emoji: '🧳', label: 'Packing' },
          { id: 'travelers', emoji: '👤', label: 'Travelers' },
          { id: 'journeys', emoji: '🗺️', label: 'Journeys' },
        ] as { id: AppTab; emoji: string; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              tab === t.id ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-xl">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
