export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild'

export type CardAction = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4'

export interface Card {
  id: string
  color: CardColor
  action: CardAction
  value: number | null   // 0-9 for number cards, null for special
  question: Question
}

export interface Question {
  text: string
  options: string[]
  correct: number // index of correct option
  category: string
}

export interface Player {
  id: string
  name: string
  avatar: string // emoji
  hand: Card[]
  score: number
}

export type GamePhase =
  | 'lobby'
  | 'dealing'
  | 'playing'
  | 'question'
  | 'effect'
  | 'winner'
  | 'history'

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  direction: 1 | -1
  discardPile: Card[]
  deck: Card[]
  phase: GamePhase
  activeCard: Card | null
  pendingDraws: number
  skipNext: boolean
  winner: Player | null
  roundNumber: number
  message: string
}

export interface RoundRecord {
  id: string
  date: string
  roundNumber: number
  players: { name: string; avatar: string; score: number; cardsLeft: number }[]
  winner: string
  duration: number // seconds
}

export interface StoredData {
  playerNames: string[]
  rounds: RoundRecord[]
  totalWins: Record<string, number>
}
