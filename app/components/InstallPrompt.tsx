'use client'

import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'fbr-install-dismissed'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Already installed or dismissed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (isStandalone) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (!ios) {
      // Android — wait for browser install prompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setTimeout(() => setShow(true), 3000)
      }
      window.addEventListener('beforeinstallprompt', handler as any)
      return () => window.removeEventListener('beforeinstallprompt', handler as any)
    } else {
      // iOS — show manual instructions after delay
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1')
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed left-4 right-4 z-50 max-w-sm mx-auto bottom-safe-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FlyBabyReady" className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800 text-sm">Add FlyBabyReady to your home screen</p>
              {isIOS ? (
                <p className="text-xs text-slate-400 mt-0.5">
                  Tap the <span className="font-semibold text-slate-600">Share</span> button, then <span className="font-semibold text-slate-600">Add to Home Screen</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">Install for the best experience</p>
              )}
            </div>
          </div>
          <button onClick={dismiss} className="text-slate-300 hover:text-slate-500 text-3xl leading-none flex-shrink-0 p-2 -mr-2">×</button>
        </div>

        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {isIOS && (
          <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="text-lg">1.</span> Tap the share icon in Safari's toolbar
            <span className="mx-1">→</span>
            <span className="text-lg">2.</span> Add to Home Screen
          </div>
        )}
      </div>
    </div>
  )
}
