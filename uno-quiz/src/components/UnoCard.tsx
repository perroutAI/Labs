import { cn } from '@/lib/utils'
import { COLOR_CONFIG, ACTION_LABEL } from '@/lib/gameData'
import type { Card } from '@/types'

interface UnoCardProps {
  card: Card
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  selected?: boolean
  faceDown?: boolean
  className?: string
  style?: React.CSSProperties
}

// Mobile-first sizes: minimum 44px touch target on 'md', xl for player hand
const SIZES = {
  sm: { card: 'w-10 h-14',  text: 'text-base', sub: 'text-[9px]'  },
  md: { card: 'w-14 h-20',  text: 'text-xl',   sub: 'text-[10px]' },
  lg: { card: 'w-20 h-28',  text: 'text-3xl',  sub: 'text-xs'     },
  xl: { card: 'w-24 h-36',  text: 'text-5xl',  sub: 'text-sm'     },
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
          'flex items-center justify-center relative overflow-hidden shadow-lg shrink-0',
          className,
        )}
        style={style}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        <span className="relative z-10 font-black text-white/50 text-xs tracking-widest">UNO</span>
        <div className="absolute inset-2 rounded-lg border border-white/10" />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        s.card,
        'rounded-xl border-4 relative overflow-hidden shrink-0',
        'flex flex-col items-center justify-center',
        'font-black shadow-xl transition-transform duration-150 active:scale-90',
        'cursor-pointer select-none touch-manipulation',
        cfg.bg,
        selected ? 'border-white -translate-y-5 shadow-2xl shadow-white/20' : cfg.border,
        disabled && !selected && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={style}
    >
      {/* Inner oval */}
      <div className={cn(
        'absolute inset-[10%] rounded-full opacity-25 rotate-45',
        card.color === 'wild'
          ? 'bg-gradient-to-br from-red-500 via-blue-500 to-green-500'
          : 'bg-white',
      )} />

      {/* Top-left label */}
      <span className={cn('absolute top-1 left-1.5 text-white font-black leading-none', s.sub)}>
        {label}
      </span>

      {/* Center */}
      <span className={cn(s.text, 'relative z-10 text-white drop-shadow font-black leading-none')}>
        {card.color === 'wild' && card.action === 'wild'  ? '🃏' :
         card.color === 'wild' && card.action === 'wild4' ? '🌈' :
         label}
      </span>

      {/* Bottom-right label (rotated) */}
      <span className={cn('absolute bottom-1 right-1.5 rotate-180 text-white font-black leading-none', s.sub)}>
        {label}
      </span>

      {selected && (
        <div className="absolute inset-0 rounded-xl ring-4 ring-white ring-opacity-80 animate-pulse" />
      )}
    </button>
  )
}
