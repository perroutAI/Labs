import { useState, useEffect, useRef } from 'react'
import type { GameState, Card, CardColor, Player } from '@/types'
import {
  createGame, nextPlayer, applyCardEffect,
  getCurrentColor, checkWinner, calculateScores, drawCards,
} from '@/lib/gameEngine'
import { canPlay, COLOR_CONFIG } from '@/lib/gameData'
import { UnoCard } from '@/components/UnoCard'
import { QuestionModal } from '@/components/QuestionModal'
import { ColorPicker } from '@/components/ColorPicker'
import { cn } from '@/lib/utils'

type UIPhase = 'playing' | 'question' | 'color-pick'

interface GameProps {
  initialPlayers: Player[]
  onGameOver: (state: GameState, winner: Player, duration: number) => void
  onQuit: () => void
}

export function Game({ initialPlayers, onGameOver, onQuit }: GameProps) {
  const [state, setState] = useState<GameState>(() =>
    createGame(initialPlayers.map(p => p.name))
  )
  const [uiPhase, setUiPhase] = useState<UIPhase>('playing')
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [unoAlert, setUnoAlert] = useState<string | null>(null)
  const startTime = useRef(Date.now())

  const currentPlayer = state.players[state.currentPlayerIndex]
  const topCard = state.discardPile[state.discardPile.length - 1]
  const currentColor = getCurrentColor(state)
  const playableCards = currentPlayer.hand.filter(c => canPlay(c, topCard, currentColor))
  const cfg = COLOR_CONFIG[currentColor]

  useEffect(() => {
    if (uiPhase !== 'playing') return
    for (const p of state.players) {
      if (p.hand.length === 1) {
        setUnoAlert(p.name)
        const t = setTimeout(() => setUnoAlert(null), 2500)
        return () => clearTimeout(t)
      }
    }
  }, [state.players, uiPhase])

  const handleCardTap = (card: Card) => {
    if (uiPhase !== 'playing') return
    if (!canPlay(card, topCard, currentColor)) {
      setShakingId(card.id)
      setTimeout(() => setShakingId(null), 500)
      return
    }
    setActiveCard(card)
    setUiPhase('question')
  }

  const handleAnswer = (correct: boolean) => {
    if (!activeCard) return
    setUiPhase('playing')

    if (!correct) {
      setState(prev => nextPlayer(drawCards(prev, currentPlayer.id, 1)))
      return
    }

    const withoutCard = {
      ...state,
      players: state.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, hand: p.hand.filter(c => c.id !== activeCard.id) }
          : p
      ),
    }

    const winner = checkWinner(withoutCard)
    if (winner) {
      const final = calculateScores(withoutCard, winner)
      setState(final)
      onGameOver(final, winner, Math.floor((Date.now() - startTime.current) / 1000))
      return
    }

    if (activeCard.action === 'wild' || activeCard.action === 'wild4') {
      setState(withoutCard)
      setUiPhase('color-pick')
      return
    }

    setState(prev => {
      const base = {
        ...prev,
        players: prev.players.map(p =>
          p.id === currentPlayer.id
            ? { ...p, hand: p.hand.filter(c => c.id !== activeCard.id) }
            : p
        ),
      }
      return nextPlayer(applyCardEffect(base, activeCard))
    })
    setActiveCard(null)
  }

  const handleColorPick = (color: CardColor) => {
    if (!activeCard) return
    setUiPhase('playing')
    setState(prev => nextPlayer(applyCardEffect(prev, activeCard, color)))
    setActiveCard(null)
  }

  const handleDraw = () => {
    if (uiPhase !== 'playing') return
    setState(prev => nextPlayer(drawCards(prev, currentPlayer.id, 1)))
  }

  return (
    <div
      className="flex flex-col bg-gray-950 overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* ── TOP BAR ── */}
      <div
        className={cn('flex items-center gap-3 px-4 shrink-0 transition-colors duration-500', cfg.bg)}
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingBottom: 12 }}
      >
        <button
          onClick={onQuit}
          className="w-14 h-14 rounded-2xl bg-black/25 flex items-center justify-center text-white text-2xl shrink-0 active:scale-90 transition-transform touch-manipulation"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight truncate">{state.message}</p>
          <p className="text-white/60 text-xs">Rodada {state.roundNumber} · {state.direction === 1 ? '▶' : '◀'}</p>
        </div>
        <div className="bg-black/25 text-white font-black text-xs px-3 py-2 rounded-full shrink-0">
          {cfg.label}
        </div>
      </div>

      {/* ── OTHER PLAYERS ── */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0 bg-black/20">
        {state.players
          .filter((_, i) => i !== state.currentPlayerIndex)
          .map(player => (
            <div key={player.id} className="flex items-center gap-2 bg-gray-800 rounded-2xl px-3 py-2.5 shrink-0">
              <span className="text-xl">{player.avatar}</span>
              <div>
                <p className="text-white font-black text-sm leading-none truncate max-w-[70px]">{player.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">🃏 {player.hand.length}</p>
              </div>
            </div>
          ))}
      </div>

      {/* ── BOARD ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 min-h-0">
        <div className="flex items-end gap-10">
          {/* Draw deck */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleDraw} disabled={uiPhase !== 'playing'} className="touch-manipulation active:scale-95 transition-transform">
              <UnoCard card={{ ...topCard, id: 'deck' }} faceDown size="lg" />
            </button>
            <span className="text-gray-500 text-xs font-bold tracking-wider">COMPRAR</span>
          </div>

          {/* Discard pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {state.discardPile.length > 1 && (
                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                  <UnoCard card={state.discardPile[state.discardPile.length - 2]} size="lg" />
                </div>
              )}
              <UnoCard card={topCard} size="lg" className="animate-bounce-in" />
            </div>
            <span className="text-gray-500 text-xs font-bold tracking-wider">DESCARTE</span>
          </div>
        </div>

        {/* Color pill */}
        <div className={cn('px-5 py-2.5 rounded-full font-black text-white', cfg.bg)}>
          Cor: {cfg.label}
        </div>
      </div>

      {/* ── PLAYER HAND PANEL ── */}
      <div
        className="bg-gray-900 rounded-t-3xl border-t-2 border-gray-800 shrink-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {/* Player info row */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: ['#e74c3c','#2980b9','#27ae60','#f39c12'][state.currentPlayerIndex] }}
          >
            {currentPlayer.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-lg leading-tight">{currentPlayer.name}</p>
            <p className="text-gray-400 text-xs">
              {currentPlayer.hand.length} carta{currentPlayer.hand.length !== 1 ? 's' : ''} ·{' '}
              <span className={playableCards.length > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {playableCards.length} jogável{playableCards.length !== 1 ? 'is' : ''}
              </span>
            </p>
          </div>
          {currentPlayer.hand.length === 1 && (
            <span className="bg-red-600 text-white font-black px-4 py-2 rounded-full text-sm animate-bounce shrink-0">
              UNO! 🃏
            </span>
          )}
        </div>

        {/* Card hand — XL cards with overlap so more are visible */}
        <div className="overflow-x-auto pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex px-4" style={{ paddingBottom: 8, paddingTop: 8 }}>
            {currentPlayer.hand.map((card, idx) => {
              const playable = canPlay(card, topCard, currentColor)
              return (
                <div
                  key={card.id}
                  className="shrink-0 transition-all duration-150"
                  style={{
                    marginLeft: idx === 0 ? 0 : -24,
                    zIndex: idx,
                    position: 'relative',
                    transform: playable ? 'translateY(-8px)' : 'translateY(0)',
                  }}
                >
                  <UnoCard
                    card={card}
                    size="xl"
                    disabled={!playable || uiPhase !== 'playing'}
                    onClick={() => handleCardTap(card)}
                    className={cn(
                      shakingId === card.id && 'animate-shake',
                      !playable && 'opacity-45',
                    )}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Draw / Pass button — 60px minimum tap target */}
        <div className="px-4">
          <button
            onClick={handleDraw}
            disabled={uiPhase !== 'playing'}
            className={cn(
              'w-full rounded-2xl font-black text-white text-xl',
              'flex items-center justify-center gap-2 touch-manipulation',
              'transition-all active:scale-[0.97]',
              playableCards.length === 0
                ? 'bg-yellow-500 shadow-lg shadow-yellow-900/60'
                : 'bg-gray-800 border-2 border-gray-700 text-gray-300',
              uiPhase !== 'playing' && 'opacity-40 cursor-not-allowed',
            )}
            style={{ minHeight: 64 }}
          >
            {playableCards.length === 0 ? '🃏 Comprar Carta' : '⏭ Passar Turno'}
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}
      {uiPhase === 'question' && activeCard && (
        <QuestionModal card={activeCard} player={currentPlayer} onAnswer={handleAnswer} />
      )}
      {uiPhase === 'color-pick' && (
        <ColorPicker onSelect={handleColorPick} playerName={currentPlayer.name} />
      )}

      {/* UNO Toast */}
      {unoAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-red-600 text-white font-black text-3xl px-10 py-6 rounded-3xl shadow-2xl animate-bounce-in text-center">
            🃏 UNO!
            <p className="text-lg font-bold mt-1 opacity-90">{unoAlert}</p>
          </div>
        </div>
      )}
    </div>
  )
}
