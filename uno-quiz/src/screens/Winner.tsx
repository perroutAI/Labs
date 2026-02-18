import type { GameState, Player } from '@/types'
import { cn } from '@/lib/utils'

interface WinnerProps {
  winner: Player
  state: GameState
  duration: number
  onPlayAgain: () => void
  onHome: () => void
  onHistory: () => void
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export function Winner({ winner, state, duration, onPlayAgain, onHome, onHistory }: WinnerProps) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-gray-950">
      {/* Confetti-like bg */}
      {['🎉', '🎊', '⭐', '🏆', '🎈', '✨'].map((e, i) => (
        <div key={i} className="absolute text-4xl opacity-20 animate-float pointer-events-none"
             style={{ left: `${i * 17}%`, top: `${10 + i * 12}%`, animationDelay: `${i * 0.4}s` }}>
          {e}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-md">
        {/* Trophy */}
        <div className="text-center mb-6">
          <div className="text-8xl animate-bounce-in mb-3">🏆</div>
          <h1 className="text-4xl font-black text-yellow-400">Vencedor!</h1>
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-4">
            <div className="text-5xl mb-2">{winner.avatar}</div>
            <p className="text-white font-black text-3xl">{winner.name}</p>
            <p className="text-yellow-400 font-bold text-sm mt-1">+{winner.score} pontos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-900 rounded-2xl p-3 text-center">
            <p className="text-2xl">⏱</p>
            <p className="text-white font-black text-lg">{formatDuration(duration)}</p>
            <p className="text-gray-500 text-xs">Duração</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-3 text-center">
            <p className="text-2xl">🃏</p>
            <p className="text-white font-black text-lg">{state.players.reduce((a, p) => a + (p.id !== winner.id ? p.hand.length : 0), 0)}</p>
            <p className="text-gray-500 text-xs">Cartas restantes</p>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-gray-900 rounded-3xl p-4 mb-5">
          <h2 className="text-white font-black text-center mb-3">📊 Placar Final</h2>
          {sorted.map((player, rank) => (
            <div key={player.id}
                 className={cn(
                   'flex items-center gap-3 py-3 px-3 rounded-2xl mb-2',
                   rank === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-800',
                 )}>
              <span className="text-2xl">
                {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '4️⃣'}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <span className="text-white font-bold flex-1">{player.name}</span>
              <div className="text-right">
                <p className="text-white font-black">{player.score} pts</p>
                <p className="text-gray-500 text-xs">{player.hand.length} cartas</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-5 rounded-2xl bg-yellow-500 text-white font-black text-xl active:scale-95 transition-all shadow-lg shadow-yellow-900"
          >
            🔄 Jogar Novamente
          </button>
          <button
            onClick={onHistory}
            className="w-full py-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 font-bold text-base active:scale-95 transition-all"
          >
            📋 Ver Histórico
          </button>
          <button
            onClick={onHome}
            className="w-full py-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 font-bold text-base active:scale-95 transition-all"
          >
            🏠 Início
          </button>
        </div>
      </div>
    </div>
  )
}
