import type { GameState, Player, Card, CardColor } from '../types'
import { buildDeck } from './gameData'
import { generateId, shuffle } from './utils'
import { AVATARS } from './gameData'

const HAND_SIZE = 7

export function createGame(playerNames: string[]): GameState {
  const deck = buildDeck()
  const players: Player[] = playerNames.map((name, i) => ({
    id: generateId(),
    name,
    avatar: AVATARS[i % AVATARS.length],
    hand: [],
    score: 0,
  }))

  // Deal 7 cards each
  let deckIndex = 0
  for (let c = 0; c < HAND_SIZE; c++) {
    for (const p of players) {
      p.hand.push(deck[deckIndex++])
    }
  }

  // Find a valid starting card (non-wild number)
  let topIndex = deckIndex
  while (deck[topIndex].action !== 'number') topIndex++
  const topCard = deck[topIndex]
  const remainingDeck = deck.filter((_, i) => i >= deckIndex && i !== topIndex)

  return {
    players,
    currentPlayerIndex: 0,
    direction: 1,
    discardPile: [topCard],
    deck: remainingDeck,
    phase: 'playing',
    activeCard: null,
    pendingDraws: 0,
    skipNext: false,
    winner: null,
    roundNumber: 1,
    message: `Vez de ${players[0].name}`,
  }
}

export function drawCards(state: GameState, playerId: string, count: number): GameState {
  const s = { ...state }
  const player = s.players.find(p => p.id === playerId)
  if (!player) return s

  if (s.deck.length < count) {
    // Reshuffle discard
    const top = s.discardPile[s.discardPile.length - 1]
    s.deck = shuffle(s.discardPile.slice(0, -1))
    s.discardPile = [top]
  }

  const drawn = s.deck.splice(0, count)
  player.hand = [...player.hand, ...drawn]
  s.players = s.players.map(p => p.id === player.id ? player : p)
  return s
}

export function nextPlayer(state: GameState): GameState {
  const s = { ...state }
  const n = s.players.length
  s.currentPlayerIndex = ((s.currentPlayerIndex + s.direction) % n + n) % n
  s.message = `Vez de ${s.players[s.currentPlayerIndex].name}`
  return s
}

export function applyCardEffect(
  state: GameState,
  card: Card,
  chosenColor?: CardColor,
): GameState {
  let s = { ...state }
  const n = s.players.length

  // Add to discard
  s.discardPile = [...s.discardPile, card]

  switch (card.action) {
    case 'number':
      break

    case 'skip':
      s.message = `⊘ ${s.players[((s.currentPlayerIndex + s.direction) % n + n) % n].name} foi pulado!`
      s = nextPlayer(s) // skip one
      break

    case 'reverse':
      s.direction = (s.direction === 1 ? -1 : 1) as 1 | -1
      s.message = `↺ Sentido invertido!`
      if (n === 2) s = nextPlayer(s) // in 2-player, reverse acts as skip
      break

    case 'draw2':
      {
        const targetIdx = ((s.currentPlayerIndex + s.direction) % n + n) % n
        const target = s.players[targetIdx]
        s = drawCards(s, target.id, 2)
        s.message = `+2 ${target.name} comprou 2 cartas!`
        s = nextPlayer(s) // skip that player
      }
      break

    case 'wild':
      s.discardPile[s.discardPile.length - 1] = { ...card, color: chosenColor ?? 'red' }
      s.message = `★ Coringa! Cor: ${chosenColor}`
      break

    case 'wild4':
      {
        s.discardPile[s.discardPile.length - 1] = { ...card, color: chosenColor ?? 'red' }
        const targetIdx = ((s.currentPlayerIndex + s.direction) % n + n) % n
        const target = s.players[targetIdx]
        s = drawCards(s, target.id, 4)
        s.message = `+4 ${target.name} comprou 4 cartas!`
        s = nextPlayer(s)
      }
      break
  }

  return s
}

export function getCurrentColor(state: GameState): CardColor {
  const top = state.discardPile[state.discardPile.length - 1]
  return top?.color ?? 'red'
}

export function checkWinner(state: GameState): Player | null {
  return state.players.find(p => p.hand.length === 0) ?? null
}

export function calculateScores(state: GameState, winner: Player): GameState {
  const s = { ...state }
  // Score = sum of all other players' hand values
  let total = 0
  for (const p of s.players) {
    if (p.id !== winner.id) {
      for (const c of p.hand) {
        const pts = c.action === 'number' ? (c.value ?? 0) :
                    (c.action === 'wild' || c.action === 'wild4') ? 50 : 20
        total += pts
      }
    }
  }
  s.players = s.players.map(p =>
    p.id === winner.id ? { ...p, score: p.score + total } : p
  )
  return s
}
