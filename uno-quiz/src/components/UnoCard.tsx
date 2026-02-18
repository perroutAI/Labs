import { cn } from '@/lib/utils'
import { COLOR_CONFIG, ACTION_LABEL } from '@/lib/gameData'
import type { Card } from '@/types'

interface UnoCardProps {
  card: Card
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  faceDown?: boolean
  className?: string
  style?: React.CSSProperties
}

const SIZES = {
  sm: { card: 'w-12 h-18', text: 'text-lg', sub: 'text-xs' },
  md: { card: 'w-16 h-24', text: 'text-2xl', sub: 'text-xs' },
  lg: { card: 'w-24 h-36', text: 'text-4xl', sub: 'text-sm' },
}

export function UnoCard({
  card,
  onClick,
  disabled,
  size = 'md',
  selected,
  faceDown,
  className,
  style,
}: UnoCardProps) {
  const cfg = COLOR_CONFIG[card.color]
  const s = SIZES[size]
  const label = card.action === 'number' ? String(card.value) : ACTION_LABEL[card.action]

  if (faceDown) {
    return (
      <div
        className={cn(
          s.card,
          'rounded-xl border-4 border-gray-600 bg-gray-800',
          'flex items-center justify-center relative overflow-hidden',
          'shadow-lg',
          className,
        )}
        style={style}
      >
        {/* UNO pattern on back */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        <div className="relative z-10 font-black text-white text-opacity-80"
             style={{ fontSize: size === 'sm' ? 10 : size === 'md' ? 14 : 20 }}>
          UNO
        </div>
        <div className="absolute inset-2 rounded-lg border border-gray-600 opacity-30" />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        s.card,
        'rounded-xl border-4 relative overflow-hidden',
        'flex flex-col items-center justify-center',
        'font-black shadow-xl transition-all duration-200 active:scale-95',
        'cursor-pointer select-none',
        cfg.bg,
        selected ? 'border-white -translate-y-4 shadow-2xl' : cfg.border,
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && onClick && 'hover:brightness-110 active:brightness-90',
        className,
      )}
      style={style}
    >
      {/* Oval inner */}
      <div
        className={cn(
          'absolute inset-2 rounded-full opacity-30 rotate-45',
          card.color === 'wild' ? 'bg-gradient-to-br from-red-500 via-blue-500 to-green-500' : 'bg-white',
        )}
      />

      {/* Top-left value */}
      <span className={cn('absolute top-1 left-2', s.sub, 'text-white font-black opacity-90')}>
        {label}
      </span>

      {/* Center value */}
      <span className={cn(s.text, 'relative z-10 text-white drop-shadow-lg font-black')}>
        {card.color === 'wild' && card.action === 'wild'  ? '🃏' :
         card.color === 'wild' && card.action === 'wild4' ? '🌈' :
         label}
      </span>

      {/* Bottom-right value (rotated) */}
      <span className={cn('absolute bottom-1 right-2 rotate-180', s.sub, 'text-white font-black opacity-90')}>
        {label}
      </span>

      {/* Selected glow */}
      {selected && (
        <div className="absolute inset-0 border-4 border-white rounded-xl animate-pulse opacity-60" />
      )}
    </button>
  )
}
