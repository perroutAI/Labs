import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import { AVATARS } from '@/lib/gameData'
import { cn } from '@/lib/utils'
import type { Player } from '@/types'
import { generateId } from '@/lib/utils'

interface LandingProps {
  onStart: (players: Player[]) => void
  onHistory: () => void
}

const EMOJIS_COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠']

export function Landing({ onStart, onHistory }: LandingProps) {
  const [names, setNames] = useState<string[]>(['', ''])
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const saved = storage.getPlayerNames()
    if (saved.length >= 2) {
      setNames(saved.slice(0, 4))
    }
  }, [])

  const addPlayer = () => {
    if (names.length < 4) setNames([...names, ''])
  }

  const removePlayer = (i: number) => {
    if (names.length <= 2) return
    setNames(names.filter((_, idx) => idx !== i))
  }

  const updateName = (i: number, val: string) => {
    setNames(names.map((n, idx) => idx === i ? val : n))
  }

  const canStart = names.every(n => n.trim().length > 0)

  const handleStart = () => {
    if (!canStart) return
    const trimmed = names.map(n => n.trim())
    storage.savePlayerNames(trimmed)
    setAnimating(true)

    const players: Player[] = trimmed.map((name, i) => ({
      id: generateId(),
      name,
      avatar: AVATARS[i % AVATARS.length],
      hand: [],
      score: 0,
    }))

    setTimeout(() => onStart(players), 400)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background cards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {EMOJIS_COLORS.map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 animate-float"
            style={{
              left: `${(i * 18) % 90}%`,
              top: `${(i * 23 + 10) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: 60 + (i % 3) * 20,
            }}
          >
            🃏
          </div>
        ))}
      </div>

      <div className={cn(
        'relative z-10 w-full max-w-md transition-all duration-400',
        animating && 'scale-95 opacity-0',
      )}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-bounce-in">🃏</div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            UNO
            <span className="text-yellow-400"> Quiz</span>
          </h1>
          <p className="text-gray-400 mt-2 text-base font-semibold">
            Responda para jogar • Erre para comprar
          </p>
        </div>

        {/* Player form */}
        <div className="bg-gray-900 rounded-3xl p-5 shadow-2xl border border-gray-800">
          <h2 className="text-white font-black text-lg mb-4 text-center">
            👥 Jogadores ({names.length}/4)
          </h2>

          <div className="space-y-3">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                     style={{ background: ['#e74c3c','#2980b9','#27ae60','#f39c12'][i] }}>
                  {AVATARS[i % AVATARS.length]}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder={`Jogador ${i + 1}`}
                  maxLength={20}
                  className={cn(
                    'flex-1 bg-gray-800 text-white placeholder-gray-600',
                    'rounded-2xl px-4 py-4 text-base font-bold',
                    'border-2 border-gray-700 focus:border-yellow-400 focus:outline-none',
                    'transition-colors',
                  )}
                />
                {names.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="w-12 h-12 rounded-2xl bg-gray-800 border-2 border-gray-700 text-gray-400 text-xl flex items-center justify-center shrink-0 active:scale-90 transition-all"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {names.length < 4 && (
            <button
              onClick={addPlayer}
              className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-gray-700 text-gray-500 font-bold text-sm active:scale-95 transition-all hover:border-gray-500 hover:text-gray-400"
            >
              + Adicionar Jogador
            </button>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={cn(
              'w-full mt-5 py-5 rounded-2xl font-black text-xl text-white',
              'transition-all active:scale-95 shadow-lg',
              canStart
                ? 'bg-yellow-500 shadow-yellow-900 hover:bg-yellow-400'
                : 'bg-gray-700 cursor-not-allowed text-gray-500',
            )}
          >
            {canStart ? '🎮 Iniciar Jogo!' : 'Preencha os nomes'}
          </button>
        </div>

        {/* History button */}
        <button
          onClick={onHistory}
          className="w-full mt-4 py-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 font-bold text-base active:scale-95 transition-all"
        >
          📋 Histórico de Partidas
        </button>

        {/* Rules */}
        <div className="mt-5 bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <h3 className="text-white font-black text-sm mb-3 text-center">📜 Regras</h3>
          <div className="space-y-2 text-xs text-gray-400 font-semibold">
            <div className="flex items-start gap-2"><span className="shrink-0">🎯</span><span>Toque em uma carta para responder uma pergunta</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">✅</span><span>Acertou → a carta é jogada!</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">❌</span><span>Errou → compre uma carta!</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">⊘</span><span>Skip pula o próximo jogador</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">↺</span><span>Reverse inverte a ordem</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">+2/+4</span><span>Próximo jogador compra cartas</span></div>
            <div className="flex items-start gap-2"><span className="shrink-0">🏆</span><span>Quem zerar a mão primeiro vence!</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
