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
    onAnswer(!timedOut && selected === card.question.correct)
  }

  const q = card.question
  const progressPct = (timeLeft / timeLimit) * 100
  const isCorrect = !timedOut && selected === q.correct

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full bg-gray-900 rounded-t-3xl overflow-hidden shadow-2xl animate-bounce-in"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {/* Card header */}
        <div className={cn('flex items-center gap-3 px-4 py-4', COLOR_CONFIG[card.color].bg)}>
          <UnoCard card={card} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{q.category}</p>
            <p className="text-white font-black text-base">{player.avatar} {player.name}</p>
          </div>
          {/* Timer circle */}
          <div className={cn(
            'w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-2xl shrink-0',
            timeLeft > 8 ? 'border-white text-white' :
            timeLeft > 4 ? 'border-yellow-300 text-yellow-300' :
                           'border-red-400 text-red-400 animate-pulse',
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
              progressPct > 25 ? 'bg-yellow-500' : 'bg-red-500',
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question text */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-white font-bold text-lg leading-snug text-center">{q.text}</p>
        </div>

        {/* Answer options — minimum 64px tap target */}
        <div className="px-4 space-y-3 pb-4">
          {q.options.map((opt, i) => {
            const ansState =
              !revealed         ? 'idle' :
              i === q.correct   ? 'correct' :
              i === selected    ? 'wrong' : 'idle'

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={cn(
                  'w-full px-4 rounded-2xl text-left font-bold text-base border-2',
                  'flex items-center gap-3 touch-manipulation transition-all duration-300',
                  'active:scale-[0.98]',
                  ansState === 'idle' && !revealed && 'bg-gray-800 border-gray-700 text-white',
                  ansState === 'idle' &&  revealed && 'bg-gray-800 border-gray-700 text-gray-500',
                  ansState === 'correct' && 'bg-green-600 border-green-400 text-white',
                  ansState === 'wrong'   && 'bg-red-700   border-red-400   text-white',
                )}
                style={{ minHeight: 64 }}
              >
                <span className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0',
                  ansState === 'correct' ? 'bg-green-400 text-white' :
                  ansState === 'wrong'   ? 'bg-red-400   text-white' :
                                          'bg-gray-700   text-gray-400',
                )}>
                  {['A','B','C','D'][i]}
                </span>
                <span className="flex-1">{opt}</span>
                {ansState === 'correct' && <span className="text-xl shrink-0">✓</span>}
                {ansState === 'wrong'   && <span className="text-xl shrink-0">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Result + confirm button */}
        {revealed && (
          <div className="px-4 pb-2">
            <p className={cn(
              'text-center font-black text-lg mb-3',
              timedOut ? 'text-orange-400' : isCorrect ? 'text-green-400' : 'text-red-400',
            )}>
              {timedOut ? '⏱ Tempo esgotado! Compre uma carta.' :
               isCorrect ? '🎉 Correto! Jogue sua carta!' :
                           '❌ Errado! Compre uma carta.'}
            </p>
            <button
              onClick={handleConfirm}
              className={cn(
                'w-full rounded-2xl font-black text-white text-xl touch-manipulation',
                'transition-all active:scale-[0.97]',
                isCorrect ? 'bg-green-600 shadow-lg shadow-green-900/60' : 'bg-red-600 shadow-lg shadow-red-900/60',
              )}
              style={{ minHeight: 68 }}
            >
              {isCorrect ? '🃏 Jogar Carta!' : '🃏 Comprar Carta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
