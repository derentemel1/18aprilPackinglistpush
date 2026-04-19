'use client'

const EMOJIS = [
  '👶','🧒','👦','👧','🧑','👩','👨','👴','👵',
  '👩‍💼','👨‍💼','👩‍🎤','👨‍🎤','👩‍🍳','👨‍🍳','👩‍✈️','👨‍✈️',
  '🦁','🐯','🦊','🐶','🐱','🐼','🦄','🐸',
  '🌟','⭐','🎈','🎉','🌈','❤️','🔥','💎',
]

export default function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div className="grid grid-cols-9 gap-1">
      {EMOJIS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`text-xl p-1 rounded-lg transition-colors ${
            value === e ? 'bg-teal-100 ring-2 ring-teal-400' : 'hover:bg-slate-100'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
