import type { CardColor } from '@/types'
import { cn } from '@/lib/utils'

const COLORS: { color: CardColor; bg: string; label: string; emoji: string }[] = [
  { color: 'red',    bg: 'bg-red-600',    label: 'Vermelho', emoji: '🔴' },
  { color: 'blue',   bg: 'bg-blue-600',   label: 'Azul',     emoji: '🔵' },
  { color: 'green',  bg: 'bg-green-600',  label: 'Verde',    emoji: '🟢' },
  { color: 'yellow', bg: 'bg-yellow-500', label: 'Amarelo',  emoji: '🟡' },
]

interface ColorPickerProps {
  onSelect: (color: CardColor) => void
  playerName: string
}

export function ColorPicker({ onSelect, playerName }: ColorPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 shadow-2xl animate-bounce-in">
        <p className="text-center text-white font-black text-xl mb-2">Escolha uma cor</p>
        <p className="text-center text-gray-400 text-sm mb-6">{playerName} jogou um Coringa</p>
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map(({ color, bg, label, emoji }) => (
            <button
              key={color}
              onClick={() => onSelect(color)}
              className={cn(
                'py-5 rounded-2xl font-black text-white text-xl',
                'flex flex-col items-center gap-2',
                'active:scale-95 transition-all shadow-lg',
                bg,
              )}
            >
              <span className="text-3xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
