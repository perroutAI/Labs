import type { Question, Card, CardColor, CardAction } from '../types'
import { generateId, shuffle } from './utils'

// ─── Questions Pool ────────────────────────────────────────────────────────
export const QUESTIONS: Question[] = [
  // Ciência
  { text: 'Qual é o elemento químico mais abundante no universo?', options: ['Oxigênio', 'Hidrogênio', 'Carbono', 'Nitrogênio'], correct: 1, category: '🔬 Ciência' },
  { text: 'Quantos planetas existem no Sistema Solar?', options: ['7', '8', '9', '10'], correct: 1, category: '🔬 Ciência' },
  { text: 'Qual é o gás que as plantas absorvem durante a fotossíntese?', options: ['Oxigênio', 'Nitrogênio', 'Dióxido de carbono', 'Hidrogênio'], correct: 2, category: '🔬 Ciência' },
  { text: 'Quantos ossos tem o corpo humano adulto?', options: ['206', '208', '210', '204'], correct: 0, category: '🔬 Ciência' },
  { text: 'Qual é a velocidade da luz no vácuo?', options: ['300.000 km/s', '150.000 km/s', '450.000 km/s', '250.000 km/s'], correct: 0, category: '🔬 Ciência' },
  { text: 'Qual planeta é conhecido como Planeta Vermelho?', options: ['Vênus', 'Júpiter', 'Marte', 'Saturno'], correct: 2, category: '🔬 Ciência' },
  { text: 'Qual é o maior órgão do corpo humano?', options: ['Fígado', 'Pulmão', 'Pele', 'Intestino'], correct: 2, category: '🔬 Ciência' },
  { text: 'Qual é o símbolo químico do ouro?', options: ['Go', 'Or', 'Au', 'Ag'], correct: 2, category: '🔬 Ciência' },
  { text: 'O DNA se encontra em qual parte da célula?', options: ['Membrana', 'Núcleo', 'Ribossomo', 'Mitocôndria'], correct: 1, category: '🔬 Ciência' },
  { text: 'Qual é o planeta mais quente do Sistema Solar?', options: ['Mercúrio', 'Vênus', 'Marte', 'Júpiter'], correct: 1, category: '🔬 Ciência' },

  // Geografia
  { text: 'Qual é a capital do Brasil?', options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], correct: 2, category: '🌍 Geografia' },
  { text: 'Qual é o maior país do mundo em área?', options: ['China', 'Canadá', 'Brasil', 'Rússia'], correct: 3, category: '🌍 Geografia' },
  { text: 'Qual é o maior oceano do mundo?', options: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'], correct: 3, category: '🌍 Geografia' },
  { text: 'Qual é o rio mais longo do mundo?', options: ['Amazonas', 'Nilo', 'Yangtzé', 'Mississippi'], correct: 1, category: '🌍 Geografia' },
  { text: 'Qual é a montanha mais alta do mundo?', options: ['K2', 'Everest', 'Aconcágua', 'Kilimanjaro'], correct: 1, category: '🌍 Geografia' },
  { text: 'Em qual continente fica o Egito?', options: ['Ásia', 'Europa', 'África', 'Oriente Médio'], correct: 2, category: '🌍 Geografia' },
  { text: 'Qual país tem mais habitantes no mundo?', options: ['Índia', 'China', 'EUA', 'Brasil'], correct: 0, category: '🌍 Geografia' },
  { text: 'Qual é a capital da Argentina?', options: ['Córdoba', 'Rosário', 'Buenos Aires', 'Mendoza'], correct: 2, category: '🌍 Geografia' },
  { text: 'Qual é o menor país do mundo?', options: ['Mônaco', 'San Marino', 'Vaticano', 'Liechtenstein'], correct: 2, category: '🌍 Geografia' },
  { text: 'Qual é o deserto mais quente do mundo?', options: ['Gobi', 'Atacama', 'Saara', 'Namib'], correct: 2, category: '🌍 Geografia' },

  // História
  { text: 'Em que ano o Brasil proclamou sua independência?', options: ['1808', '1822', '1889', '1500'], correct: 1, category: '📜 História' },
  { text: 'Quem descobriu o Brasil?', options: ['Cristóvão Colombo', 'Pedro Álvares Cabral', 'Vasco da Gama', 'Fernão de Magalhães'], correct: 1, category: '📜 História' },
  { text: 'Em que ano ocorreu a Segunda Guerra Mundial?', options: ['1914-1918', '1939-1945', '1935-1942', '1941-1947'], correct: 1, category: '📜 História' },
  { text: 'Quem foi o primeiro presidente do Brasil?', options: ['Dom Pedro II', 'Getúlio Vargas', 'Deodoro da Fonseca', 'Floriano Peixoto'], correct: 2, category: '📜 História' },
  { text: 'Em que ano o homem chegou à Lua?', options: ['1967', '1968', '1969', '1970'], correct: 2, category: '📜 História' },
  { text: 'Qual imperador construiu as pirâmides de Gizé?', options: ['Tutankhamun', 'Cleópatra', 'Quéops', 'Ramsés II'], correct: 2, category: '📜 História' },
  { text: 'Quando ocorreu a Revolução Francesa?', options: ['1776', '1789', '1799', '1804'], correct: 1, category: '📜 História' },
  { text: 'Em que país ocorreu a Revolução Industrial?', options: ['França', 'Alemanha', 'EUA', 'Inglaterra'], correct: 3, category: '📜 História' },

  // Cultura Pop
  { text: 'Qual personagem diz "Que a força esteja com você"?', options: ['Han Solo', 'Luke Skywalker', 'Obi-Wan Kenobi', 'Todos os Jedi'], correct: 3, category: '🎬 Cultura Pop' },
  { text: 'Qual banda gravou "Bohemian Rhapsody"?', options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Rolling Stones'], correct: 2, category: '🎬 Cultura Pop' },
  { text: 'Em qual cidade fica a Torre Eiffel?', options: ['Lyon', 'Marseille', 'Paris', 'Bordeaux'], correct: 2, category: '🎬 Cultura Pop' },
  { text: 'Qual é o nome do protagonista de Harry Potter?', options: ['Hermione Granger', 'Harry Potter', 'Ron Weasley', 'Draco Malfoy'], correct: 1, category: '🎬 Cultura Pop' },
  { text: 'Quem pintou a Mona Lisa?', options: ['Michelangelo', 'Rafael', 'Leonardo da Vinci', 'Caravaggio'], correct: 2, category: '🎬 Cultura Pop' },
  { text: 'Qual é o esporte mais popular do Brasil?', options: ['Vôlei', 'Basquete', 'Futebol', 'Natação'], correct: 2, category: '🎬 Cultura Pop' },
  { text: 'Quantas cores tem o arco-íris?', options: ['5', '6', '7', '8'], correct: 2, category: '🎬 Cultura Pop' },
  { text: 'Qual é a moeda do Brasil?', options: ['Peso', 'Dólar', 'Euro', 'Real'], correct: 3, category: '🎬 Cultura Pop' },

  // Matemática
  { text: 'Quanto é 7 × 8?', options: ['54', '56', '58', '63'], correct: 1, category: '🔢 Matemática' },
  { text: 'Qual é a raiz quadrada de 144?', options: ['11', '12', '13', '14'], correct: 1, category: '🔢 Matemática' },
  { text: 'Quanto é 25% de 200?', options: ['40', '45', '50', '55'], correct: 2, category: '🔢 Matemática' },
  { text: 'Qual é o número pi aproximado?', options: ['3,14', '3,16', '3,12', '3,18'], correct: 0, category: '🔢 Matemática' },
  { text: 'Quanto é 2 elevado à 10?', options: ['512', '1024', '2048', '256'], correct: 1, category: '🔢 Matemática' },
  { text: 'Quantos lados tem um hexágono?', options: ['5', '6', '7', '8'], correct: 1, category: '🔢 Matemática' },
  { text: 'Qual é o próximo número primo após 11?', options: ['12', '13', '14', '15'], correct: 1, category: '🔢 Matemática' },
  { text: 'Quanto é 15% de 300?', options: ['40', '42', '45', '50'], correct: 2, category: '🔢 Matemática' },

  // Natureza
  { text: 'Qual é o animal mais rápido do mundo?', options: ['Guepardo', 'Falcão-peregrino', 'Leão', 'Águia'], correct: 0, category: '🐾 Natureza' },
  { text: 'Qual é o maior animal do mundo?', options: ['Elefante africano', 'Tubarão-baleia', 'Baleia-azul', 'Girafa'], correct: 2, category: '🐾 Natureza' },
  { text: 'Quantas patas tem uma aranha?', options: ['6', '7', '8', '10'], correct: 2, category: '🐾 Natureza' },
  { text: 'Qual é o único mamífero que voa?', options: ['Ornitorrinco', 'Morcego', 'Esquilo-voador', 'Peixe-voador'], correct: 1, category: '🐾 Natureza' },
  { text: 'Qual árvore produz bolotas?', options: ['Pinheiro', 'Carvalho', 'Bordo', 'Castanheiro'], correct: 1, category: '🐾 Natureza' },
]

// ─── Avatars ────────────────────────────────────────────────────────────────
export const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦝', '🐻', '🐼', '🦄', '🐉', '🦋', '🦅', '🐬']

// ─── Deck Builder ───────────────────────────────────────────────────────────
const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow']

function makeCard(color: CardColor, action: CardAction, value: number | null, q: Question): Card {
  return { id: generateId(), color, action, value, question: q }
}

export function buildDeck(): Card[] {
  const qs = shuffle(QUESTIONS)
  let qi = 0
  const next = () => qs[qi++ % qs.length]
  const cards: Card[] = []

  for (const color of COLORS) {
    // 0 × 1
    cards.push(makeCard(color, 'number', 0, next()))
    // 1–9 × 2
    for (let v = 1; v <= 9; v++) {
      cards.push(makeCard(color, 'number', v, next()))
      cards.push(makeCard(color, 'number', v, next()))
    }
    // Skip × 2
    cards.push(makeCard(color, 'skip', null, next()))
    cards.push(makeCard(color, 'skip', null, next()))
    // Reverse × 2
    cards.push(makeCard(color, 'reverse', null, next()))
    cards.push(makeCard(color, 'reverse', null, next()))
    // Draw 2 × 2
    cards.push(makeCard(color, 'draw2', null, next()))
    cards.push(makeCard(color, 'draw2', null, next()))
  }

  // Wild × 4
  for (let i = 0; i < 4; i++) cards.push(makeCard('wild', 'wild', null, next()))
  // Wild Draw 4 × 4
  for (let i = 0; i < 4; i++) cards.push(makeCard('wild', 'wild4', null, next()))

  return shuffle(cards)
}

// ─── Card helpers ───────────────────────────────────────────────────────────
export const COLOR_CONFIG: Record<CardColor, { bg: string; border: string; text: string; label: string }> = {
  red:    { bg: 'bg-red-600',    border: 'border-red-400',    text: 'text-red-400',    label: 'Vermelho' },
  blue:   { bg: 'bg-blue-600',   border: 'border-blue-400',   text: 'text-blue-400',   label: 'Azul' },
  green:  { bg: 'bg-green-600',  border: 'border-green-400',  text: 'text-green-400',  label: 'Verde' },
  yellow: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-400', label: 'Amarelo' },
  wild:   { bg: 'bg-gray-800',   border: 'border-purple-500', text: 'text-purple-400', label: 'Coringa' },
}

export const ACTION_LABEL: Record<CardAction, string> = {
  number:  '',
  skip:    '⊘',
  reverse: '↺',
  draw2:   '+2',
  wild:    '★',
  wild4:   '+4',
}

export function cardPoints(card: Card): number {
  if (card.action === 'number') return card.value ?? 0
  if (card.action === 'wild' || card.action === 'wild4') return 50
  return 20
}

export function canPlay(card: Card, top: Card, currentColor: CardColor): boolean {
  if (card.action === 'wild' || card.action === 'wild4') return true
  if (card.color === currentColor) return true
  if (card.color === top.color) return true
  if (card.action !== 'number' && card.action === top.action) return true
  if (card.action === 'number' && top.action === 'number' && card.value === top.value) return true
  return false
}
