import { useState, useCallback } from 'react'
import type { GameState, Player } from './types'
import { Landing } from './screens/Landing'
import { Game } from './screens/Game'
import { Winner } from './screens/Winner'
import { History } from './screens/History'
import { storage } from './lib/storage'
import { generateId } from './lib/utils'

type Screen = 'landing' | 'game' | 'winner' | 'history'

interface WinnerData {
  winner: Player
  state: GameState
  duration: number
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [gamePlayers, setGamePlayers] = useState<Player[]>([])
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null)
  const [roundCount, setRoundCount] = useState(0)

  const handleStart = useCallback((players: Player[]) => {
    setGamePlayers(players)
    setScreen('game')
  }, [])

  const handleGameOver = useCallback((state: GameState, winner: Player, duration: number) => {
    setWinnerData({ winner, state, duration })

    // Save round to history
    storage.addRound({
      id: generateId(),
      date: new Date().toISOString(),
      roundNumber: roundCount + 1,
      players: state.players.map(p => ({
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        cardsLeft: p.hand.length,
      })),
      winner: winner.name,
      duration,
    })
    setRoundCount(c => c + 1)
    setScreen('winner')
  }, [roundCount])

  const handlePlayAgain = useCallback(() => {
    setScreen('game')
    setWinnerData(null)
  }, [])

  const handleQuit = useCallback(() => {
    setScreen('landing')
    setWinnerData(null)
  }, [])

  if (screen === 'landing') {
    return (
      <Landing
        onStart={handleStart}
        onHistory={() => setScreen('history')}
      />
    )
  }

  if (screen === 'game') {
    return (
      <Game
        initialPlayers={gamePlayers}
        onGameOver={handleGameOver}
        onQuit={handleQuit}
      />
    )
  }

  if (screen === 'winner' && winnerData) {
    return (
      <Winner
        winner={winnerData.winner}
        state={winnerData.state}
        duration={winnerData.duration}
        onPlayAgain={handlePlayAgain}
        onHome={handleQuit}
        onHistory={() => setScreen('history')}
      />
    )
  }

  if (screen === 'history') {
    return (
      <History
        onBack={() => setScreen('landing')}
      />
    )
  }

  return null
}
