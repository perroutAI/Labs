import type { StoredData, RoundRecord } from '../types'

const KEY = 'uno-quiz-data'

function load(): StoredData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { playerNames: [], rounds: [], totalWins: {} }
    return JSON.parse(raw) as StoredData
  } catch {
    return { playerNames: [], rounds: [], totalWins: {} }
  }
}

function save(data: StoredData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export const storage = {
  getPlayerNames(): string[] {
    return load().playerNames
  },

  savePlayerNames(names: string[]) {
    const data = load()
    data.playerNames = names
    save(data)
  },

  getRounds(): RoundRecord[] {
    return load().rounds
  },

  addRound(record: RoundRecord) {
    const data = load()
    data.rounds.unshift(record)          // newest first
    if (data.rounds.length > 50) data.rounds = data.rounds.slice(0, 50)
    data.totalWins[record.winner] = (data.totalWins[record.winner] ?? 0) + 1
    save(data)
  },

  getTotalWins(): Record<string, number> {
    return load().totalWins
  },

  clearHistory() {
    const data = load()
    data.rounds = []
    data.totalWins = {}
    save(data)
  },
}
