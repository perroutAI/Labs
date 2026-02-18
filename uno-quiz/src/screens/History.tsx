import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage'
import type { RoundRecord } from '@/types'
import { cn, formatDate } from '@/lib/utils'

interface HistoryProps {
  onBack: () => void
}

export function History({ onBack }: HistoryProps) {
  const [rounds, setRounds] = useState<RoundRecord[]>([])
  const [wins, setWins] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setRounds(storage.getRounds())
    setWins(storage.getTotalWins())
  }, [])

  const handleClear = () => {
    if (confirm('Apagar todo o histórico?')) {
      storage.clearHistory()
      setRounds([])
      setWins({})
    }
  }

  const topWinners = Object.entries(wins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 px-4 pt-safe-top py-4 flex items-center gap-3 border-b border-gray-800">
        <button onClick={onBack}
          className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white active:scale-90 transition-all">
          ←
        </button>
        <h1 className="text-white font-black text-xl flex-1">📋 Histórico</h1>
        {rounds.length > 0 && (
          <button onClick={handleClear}
            className="text-red-400 text-sm font-bold active:scale-95 transition-all">
            Limpar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Leaderboard */}
        {topWinners.length > 0 && (
          <div className="bg-gray-900 rounded-3xl p-4">
            <h2 className="text-white font-black text-center mb-3">🏆 Hall da Fama</h2>
            {topWinners.map(([name, count], i) => (
              <div key={name} className={cn(
                'flex items-center gap-3 py-2 px-3 rounded-2xl mb-2',
                i === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-800',
              )}>
                <span className="text-2xl">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                </span>
                <span className="text-white font-bold flex-1">{name}</span>
                <span className="text-yellow-400 font-black">{count} vitória{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Round list */}
        {rounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <p className="text-gray-500 font-bold text-lg">Nenhuma partida ainda</p>
            <p className="text-gray-600 text-sm mt-1">Jogue uma partida para ver o histórico!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-gray-400 font-bold text-sm uppercase tracking-wide">
              Partidas recentes ({rounds.length})
            </h2>
            {rounds.map(round => (
              <div key={round.id}
                   className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                {/* Round header */}
                <button
                  className="w-full px-4 py-3 flex items-center gap-3 active:bg-gray-800 transition-all"
                  onClick={() => setExpanded(expanded === round.id ? null : round.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-400 font-black text-sm">#{round.roundNumber}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">
                      🏆 {round.winner}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(round.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">⏱ {Math.floor(round.duration / 60)}m {round.duration % 60}s</p>
                    <p className="text-gray-600 text-xs">{round.players.length} jogadores</p>
                  </div>
                  <span className="text-gray-600 ml-1">{expanded === round.id ? '▲' : '▼'}</span>
                </button>

                {/* Expanded details */}
                {expanded === round.id && (
                  <div className="px-4 pb-3 border-t border-gray-800">
                    {round.players
                      .sort((a, b) => b.score - a.score)
                      .map((p, i) => (
                        <div key={p.name}
                             className={cn(
                               'flex items-center gap-2 py-2',
                               i < round.players.length - 1 && 'border-b border-gray-800',
                             )}>
                          <span>{p.avatar}</span>
                          <span className={cn(
                            'text-sm font-bold flex-1',
                            p.name === round.winner ? 'text-yellow-400' : 'text-gray-300',
                          )}>
                            {p.name}
                            {p.name === round.winner && ' 🏆'}
                          </span>
                          <span className="text-gray-400 text-xs">{p.cardsLeft} cartas</span>
                          <span className="text-white font-black text-sm">{p.score} pts</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
