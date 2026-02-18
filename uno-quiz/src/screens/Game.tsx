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

type UIPhase = 'playing' | 'question' | 'color-pick' | 'uno-alert'

interface GameProps {
  initialPlayers: Player[]
  onGameOver: (state: GameState, winner: Player, duration: number) => void
  onQuit: () => void
}

export function Game({ initialPlayers, onGameOver, onQuit }: GameProps) {
  const [state, setState] = useState<GameState>(() => createGame(initialPlayers.map(p => p.name)))
  const [uiPhase, setUiPhase] = useState<UIPhase>('playing')
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [unoAlert, setUnoAlert] = useState<string | null>(null)
  const startTime = useRef(Date.now())

  const currentPlayer = state.players[state.currentPlayerIndex]
  const topCard = state.discardPile[state.discardPile.length - 1]
  const currentColor = getCurrentColor(state)
  const playableCards = currentPlayer.hand.filter(c => canPlay(c, topCard, currentColor))

  // Check for UNO (1 card left) after state changes
  useEffect(() => {
    if (uiPhase !== 'playing') return
    for (const p of state.players) {
      if (p.hand.length === 1) {
        setUnoAlert(p.name)
        setTimeout(() => setUnoAlert(null), 2000)
        break
      }
    }
  }, [state.players, uiPhase])

  const handleCardTap = (card: Card) => {
    if (uiPhase !== 'playing') return
    if (!canPlay(card, topCard, currentColor)) {
      // Flash the card
      setSelectedCardId(card.id)
      setTimeout(() => setSelectedCardId(null), 600)
      return
    }
    setActiveCard(card)
    setUiPhase('question')
  }

  const handleAnswer = async (correct: boolean) => {
    if (!activeCard) return
    setUiPhase('playing')

    if (!correct) {
      // Wrong: draw 1 card and pass
      setState(prev => {
        const next = drawCards(prev, currentPlayer.id, 1)
        return nextPlayer(next)
      })
      return
    }

    // Correct: remove card from hand
    setState(prev => {
      const updated = {
        ...prev,
        players: prev.players.map(p =>
          p.id === currentPlayer.id
            ? { ...p, hand: p.hand.filter(c => c.id !== activeCard.id) }
            : p
        ),
      }
      return updated
    })

    // Check for winner
    const updatedState = {
      ...state,
      players: state.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, hand: p.hand.filter(c => c.id !== activeCard.id) }
          : p
      ),
    }
    const winner = checkWinner(updatedState)
    if (winner) {
      const finalState = calculateScores(updatedState, winner)
      setState(finalState)
      const duration = Math.floor((Date.now() - startTime.current) / 1000)
      onGameOver(finalState, winner, duration)
      return
    }

    // Wild: pick color first
    if (activeCard.action === 'wild' || activeCard.action === 'wild4') {
      setUiPhase('color-pick')
      return
    }

    // Apply effect and advance turn
    setState(prev => {
      const after = applyCardEffect(prev, activeCard)
      return nextPlayer(after)
    })
    setActiveCard(null)
  }

  const handleColorPick = (color: CardColor) => {
    if (!activeCard) return
    setUiPhase('playing')
    setState(prev => {
      const after = applyCardEffect(prev, activeCard, color)
      return nextPlayer(after)
    })
    setActiveCard(null)
  }

  const handleDraw = () => {
    if (uiPhase !== 'playing') return
    setState(prev => {
      const next = drawCards(prev, currentPlayer.id, 1)
      return nextPlayer(next)
    })
  }

  const cfg = COLOR_CONFIG[currentColor]

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      {/* Top bar */}
      <div className={cn('px-4 pt-safe-top py-3 flex items-center gap-3 transition-colors duration-500', cfg.bg)}>
        <button onClick={onQuit}
          className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white active:scale-90 transition-all">
          ✕
        </button>
        <div className="flex-1">
          <p className="text-white font-black text-sm leading-none">{state.message}</p>
          <p className="text-white/60 text-xs">Rodada {state.roundNumber} • {state.direction === 1 ? '→' : '←'}</p>
        </div>
        {/* Color indicator */}
        <div className={cn('px-3 py-1 rounded-full bg-black/20 text-white font-bold text-xs')}>
          {cfg.label}
        </div>
      </div>

      {/* Other players */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {state.players
          .filter((_, i) => i !== state.currentPlayerIndex)
          .map(player => (
            <div key={player.id}
                 className="flex flex-col items-center gap-1 bg-gray-900 rounded-2xl px-3 py-2 min-w-[70px] shrink-0">
              <div className="text-xl">{player.avatar}</div>
              <p className="text-xs text-white font-bold truncate max-w-[60px] text-center">{player.name}</p>
              {/* mini face-down cards */}
              <div className="flex -space-x-3">
                {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
                  <div key={i}
                       className="w-7 h-10 rounded-md bg-gray-700 border-2 border-gray-600 flex items-center justify-center text-xs"
                       style={{ zIndex: i }}>
                    🃏
                  </div>
                ))}
                {player.hand.length > 5 && (
                  <div className="w-7 h-10 rounded-md bg-gray-600 flex items-center justify-center text-xs text-white font-bold">
                    +{player.hand.length - 5}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{player.hand.length} carta{player.hand.length !== 1 ? 's' : ''}</p>
            </div>
          ))}
      </div>

      {/* Game board center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-4">
        {/* Discard + Deck */}
        <div className="flex items-center gap-8">
          {/* Deck */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDraw}
              disabled={uiPhase !== 'playing'}
              className="active:scale-95 transition-all"
            >
              <UnoCard
                card={{ ...topCard, id: 'deck' }}
                faceDown
                size="lg"
                className={cn(uiPhase === 'playing' && 'animate-pulse-glow')}
              />
            </button>
            <p className="text-gray-400 text-xs font-semibold">Comprar</p>
          </div>

          {/* Discard pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {state.discardPile.length > 1 && (
                <div className="absolute top-1 left-1 opacity-50">
                  <UnoCard card={state.discardPile[state.discardPile.length - 2]} size="lg" />
                </div>
              )}
              <div className="animate-bounce-in">
                <UnoCard card={topCard} size="lg" />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-semibold">Descarte</p>
          </div>
        </div>

        {/* Current color badge */}
        <div className={cn('px-4 py-2 rounded-full font-black text-white text-sm', cfg.bg)}>
          Cor atual: {cfg.label}
        </div>
      </div>

      {/* Current player section */}
      <div className="bg-gray-900 rounded-t-3xl px-4 pt-4 pb-safe-bottom">
        {/* Player info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: ['#e74c3c','#2980b9','#27ae60','#f39c12'][state.currentPlayerIndex] }}>
            {currentPlayer.avatar}
          </div>
          <div>
            <p className="text-white font-black text-base">{currentPlayer.name}</p>
            <p className="text-gray-400 text-xs">
              {currentPlayer.hand.length} carta{currentPlayer.hand.length !== 1 ? 's' : ''} •
              {playableCards.length} jogável{playableCards.length !== 1 ? 'is' : ''}
            </p>
          </div>
          {currentPlayer.hand.length === 1 && (
            <div className="ml-auto bg-red-600 text-white font-black px-3 py-1 rounded-full text-sm animate-bounce">
              UNO! 🃏
            </div>
          )}
        </div>

        {/* Hand */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-2 min-w-max px-1">
            {currentPlayer.hand.map(card => {
              const playable = canPlay(card, topCard, currentColor)
              return (
                <div key={card.id}
                     className={cn('animate-deal', !playable && 'opacity-50')}
                     style={{ animationDuration: '0.3s' }}>
                  <UnoCard
                    card={card}
                    size="md"
                    selected={selectedCardId === card.id}
                    disabled={!playable || uiPhase !== 'playing'}
                    onClick={() => handleCardTap(card)}
                    className={cn(
                      playable && uiPhase === 'playing' && 'hover:-translate-y-2',
                      selectedCardId === card.id && 'animate-shake',
                    )}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Draw button */}
        <button
          onClick={handleDraw}
          disabled={uiPhase !== 'playing'}
          className={cn(
            'w-full py-4 rounded-2xl font-black text-white text-base mb-4',
            'transition-all active:scale-95',
            playableCards.length === 0
              ? 'bg-yellow-600 shadow-lg shadow-yellow-900'
              : 'bg-gray-800 border border-gray-700 text-gray-400',
            uiPhase !== 'playing' && 'opacity-40 cursor-not-allowed',
          )}
        >
          {playableCards.length === 0 ? '🃏 Comprar Carta (sem jogáveis)' : '🃏 Passar / Comprar'}
        </button>
      </div>

      {/* Modals */}
      {uiPhase === 'question' && activeCard && (
        <QuestionModal
          card={activeCard}
          player={currentPlayer}
          onAnswer={handleAnswer}
        />
      )}

      {uiPhase === 'color-pick' && (
        <ColorPicker
          onSelect={handleColorPick}
          playerName={currentPlayer.name}
        />
      )}

      {/* UNO Alert */}
      {unoAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-red-600 text-white font-black text-xl px-6 py-3 rounded-full shadow-2xl animate-bounce-in">
            🃏 {unoAlert} gritou UNO!
          </div>
        </div>
      )}
    </div>
  )
}
