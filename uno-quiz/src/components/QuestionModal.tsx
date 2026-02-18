import { useState, useEffect } from 'react'
import { UnoCard } from './UnoCard'
import { COLOR_CONFIG } from '@/lib/gameData'
import type { Card, Player } from '@/types'
import { cn } from '@/lib/utils'

interface QuestionModalProps {
  card: Card
  player: Player
  onAnswer: (correct: boolean) => void
  timeLimit?: number
}

export function QuestionModal({ card, player, onAnswer, timeLimit = 15 }: QuestionModalProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (revealed) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval)
          setTimedOut(true)
          setRevealed(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [revealed])

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
  }

  const handleConfirm = () => {
    if (timedOut) {
      onAnswer(false)
      return
    }
    onAnswer(selected === card.question.correct)
  }

  const q = card.question
  const progressPct = (timeLeft / timeLimit) * 100
  const isCorrect = selected === q.correct

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className={cn('p-4 flex items-center gap-3', COLOR_CONFIG[card.color].bg)}>
          <UnoCard card={card} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{q.category}</p>
            <p className="text-white font-black text-sm">{player.avatar} {player.name}</p>
          </div>
          {/* Timer */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center font-black text-xl',
            'border-4',
            timeLeft > 8 ? 'border-white text-white' :
            timeLeft > 4 ? 'border-yellow-300 text-yellow-300' :
                           'border-red-400 text-red-400 animate-pulse'
          )}>
            {timeLeft}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-gray-800">
          <div
            className={cn(
              'h-full transition-all duration-1000',
              progressPct > 50 ? 'bg-green-500' :
              progressPct > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question */}
        <div className="px-5 pt-5 pb-3">
          <p className="text-white font-bold text-base leading-snug text-center">{q.text}</p>
        </div>

        {/* Options */}
        <div className="px-4 pb-2 grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            let state: 'idle' | 'correct' | 'wrong' | 'missed' = 'idle'
            if (revealed) {
              if (i === q.correct) state = 'correct'
              else if (i === selected) state = 'wrong'
              else state = 'idle'
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={cn(
                  'w-full py-4 px-4 rounded-2xl text-left font-bold text-base',
                  'transition-all duration-300 border-2',
                  'flex items-center gap-3 active:scale-95',
                  state === 'idle' && !revealed && 'bg-gray-800 border-gray-700 text-white hover:border-white hover:bg-gray-700',
                  state === 'idle' && revealed && 'bg-gray-800 border-gray-700 text-gray-500',
                  state === 'correct' && 'bg-green-600 border-green-400 text-white animate-bounce-in',
                  state === 'wrong'   && 'bg-red-700 border-red-400 text-white animate-shake',
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0',
                  state === 'correct' ? 'bg-green-400 text-white' :
                  state === 'wrong'   ? 'bg-red-400 text-white'   :
                                       'bg-gray-700 text-gray-400',
                )}>
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                {opt}
                {state === 'correct' && <span className="ml-auto">✓</span>}
                {state === 'wrong'   && <span className="ml-auto">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Result / Confirm */}
        {revealed && (
          <div className="px-4 pb-5 pt-2">
            {timedOut ? (
              <p className="text-center text-orange-400 font-bold mb-3">⏱ Tempo esgotado! Compre uma carta.</p>
            ) : isCorrect ? (
              <p className="text-center text-green-400 font-black text-lg mb-3">🎉 Correto! Jogue sua carta!</p>
            ) : (
              <p className="text-center text-red-400 font-bold mb-3">❌ Errado! Compre uma carta.</p>
            )}
            <button
              onClick={handleConfirm}
              className={cn(
                'w-full py-4 rounded-2xl font-black text-white text-lg',
                'active:scale-95 transition-all',
                isCorrect && !timedOut ? 'bg-green-600 shadow-lg shadow-green-900' : 'bg-red-600 shadow-lg shadow-red-900',
              )}
            >
              {isCorrect && !timedOut ? '🃏 Jogar Carta!' : '🃏 Comprar Carta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
