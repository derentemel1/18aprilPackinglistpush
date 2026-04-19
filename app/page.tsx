'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AuthScreen from './components/AuthScreen'
import JourneysScreen from './components/screens/JourneysScreen'
import type { User } from '@supabase/supabase-js'

const LOCAL_AUTH_KEY = 'packing-guest'

export default function Page() {
  const [user, setUser] = useState<User | null | 'guest'>(null)

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
    <div className="min-h-screen flex flex-col bg-slate-100">
      <JourneysScreen user={user} />

      {/* Sign out — top right corner */}
      <div className="fixed top-3 right-4 z-30">
        <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
