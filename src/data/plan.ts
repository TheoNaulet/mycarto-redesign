// Synthetic demonstration data: the information system of a fictional company.
// It illustrates how myCarto links its three layers; none of it is a real customer.

export type FloorId = 0 | 1 | 2

export interface Floor {
  id: FloorId
  short: string
  name: string
  tag: string
}

export interface PlanLink {
  to: string
  rel: string
}

export interface Room {
  id: string
  floor: FloorId
  name: string
  type: string
  /** Position on a 6 x 4 grid (columns A to F, rows 1 to 4) */
  col: number
  row: number
  cols: number
  rows: number
  fact: string
  links: PlanLink[]
}

export const CELL_W = 160
export const CELL_H = 120
export const COLS = 6
export const ROWS = 4
export const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export const floors: Floor[] = [
  { id: 2, short: 'Niveau 2', name: "Fondamentaux de l'entreprise", tag: 'Fondamentaux' },
  { id: 1, short: 'Niveau 1', name: 'Urbanisation du SI', tag: 'Urbanisation' },
  { id: 0, short: 'Niveau 0', name: 'Patrimoine informatique', tag: 'Patrimoine' },
]

export const rooms: Room[] = [
  // Niveau 2 : organisation, processus, acteurs
  {
    id: 'dg', floor: 2, name: 'Direction générale', type: 'Entité',
    col: 0, row: 0, cols: 2, rows: 1,
    fact: 'Pilote la stratégie et la feuille de route numérique.',
    links: [{ to: 'q-pilotage', rel: "S'appuie sur" }],
  },
  {
    id: 'ventes', floor: 2, name: 'Direction commerciale', type: 'Entité',
    col: 2, row: 0, cols: 2, rows: 1,
    fact: '84 commerciaux répartis sur 6 agences.',
    links: [{ to: 'p-commande', rel: 'Porte' }, { to: 'q-relation', rel: "S'appuie sur" }],
  },
  {
    id: 'production', floor: 2, name: 'Production', type: 'Entité',
    col: 4, row: 0, cols: 2, rows: 2,
    fact: '3 sites, dont 1 classé site critique.',
    links: [{ to: 'p-commande', rel: 'Exécute' }, { to: 'q-commandes', rel: "S'appuie sur" }],
  },
  {
    id: 'p-commande', floor: 2, name: 'Processus Commande client', type: 'Processus métier',
    col: 0, row: 1, cols: 4, rows: 1,
    fact: '12 activités modélisées en BPMN 2.',
    links: [{ to: 'ventes', rel: 'Porté par' }, { to: 'q-commandes', rel: "S'appuie sur" }, { to: 'q-relation', rel: "S'appuie sur" }],
  },
  {
    id: 'rh', floor: 2, name: 'Ressources humaines', type: 'Entité',
    col: 0, row: 2, cols: 2, rows: 2,
    fact: 'Gère 1 450 collaborateurs.',
    links: [{ to: 'q-paie', rel: "S'appuie sur" }],
  },
  {
    id: 'finance', floor: 2, name: 'Finance et achats', type: 'Entité',
    col: 2, row: 2, cols: 2, rows: 2,
    fact: 'Clôture mensuelle à J+5.',
    links: [{ to: 'q-compta', rel: "S'appuie sur" }],
  },
  {
    id: 'service-client', floor: 2, name: 'Service client', type: 'Acteur',
    col: 4, row: 2, cols: 2, rows: 2,
    fact: 'Traite 900 demandes par jour.',
    links: [{ to: 'p-commande', rel: 'Intervient dans' }, { to: 'q-donnees', rel: 'Consulte' }],
  },

  // Niveau 1 : urbanisation (quartiers du POS)
  {
    id: 'q-relation', floor: 1, name: 'Relation client', type: 'Quartier',
    col: 0, row: 0, cols: 2, rows: 2,
    fact: 'Zone Opérations, 3 blocs fonctionnels.',
    links: [{ to: 'ventes', rel: 'Sert' }, { to: 'crm', rel: 'Réalisé par' }, { to: 'portail', rel: 'Réalisé par' }, { to: 'q-echanges', rel: 'Échange via' }],
  },
  {
    id: 'q-commandes', floor: 1, name: 'Commandes', type: 'Quartier',
    col: 2, row: 0, cols: 2, rows: 2,
    fact: 'Zone Opérations, 4 blocs fonctionnels.',
    links: [{ to: 'p-commande', rel: 'Sert' }, { to: 'erp', rel: 'Réalisé par' }, { to: 'q-echanges', rel: 'Échange via' }],
  },
  {
    id: 'q-compta', floor: 1, name: 'Comptabilité', type: 'Quartier',
    col: 4, row: 0, cols: 2, rows: 1,
    fact: 'Zone Support, 2 blocs fonctionnels.',
    links: [{ to: 'finance', rel: 'Sert' }, { to: 'erp', rel: 'Réalisé par' }],
  },
  {
    id: 'q-paie', floor: 1, name: 'Paie et talents', type: 'Quartier',
    col: 4, row: 1, cols: 2, rows: 1,
    fact: 'Zone Support, 2 blocs fonctionnels.',
    links: [{ to: 'rh', rel: 'Sert' }, { to: 'sirh', rel: 'Réalisé par' }],
  },
  {
    id: 'q-echanges', floor: 1, name: 'Échanges et interfaces', type: 'Zone',
    col: 0, row: 2, cols: 6, rows: 1,
    fact: '46 interfaces documentées.',
    links: [{ to: 'esb', rel: 'Réalisée par' }, { to: 'q-relation', rel: 'Relie' }, { to: 'q-commandes', rel: 'Relie' }],
  },
  {
    id: 'q-donnees', floor: 1, name: 'Objet métier Client', type: 'Référentiel',
    col: 0, row: 3, cols: 3, rows: 1,
    fact: 'Source de vérité unique pour 210 000 clients.',
    links: [{ to: 'service-client', rel: 'Consulté par' }, { to: 'mdm', rel: 'Réalisé par' }],
  },
  {
    id: 'q-pilotage', floor: 1, name: 'Pilotage et décisionnel', type: 'Zone',
    col: 3, row: 3, cols: 3, rows: 1,
    fact: '28 indicateurs suivis en comité.',
    links: [{ to: 'dg', rel: 'Sert' }, { to: 'bi', rel: 'Réalisé par' }],
  },

  // Niveau 0 : patrimoine (applications, interfaces, infrastructure)
  {
    id: 'crm', floor: 0, name: 'CRM Ventes', type: 'Application',
    col: 0, row: 0, cols: 2, rows: 1,
    fact: 'Criticité haute, 310 utilisateurs.',
    links: [{ to: 'q-relation', rel: 'Supporte' }, { to: 'esb', rel: 'Envoie vers' }, { to: 'cloud', rel: 'Hébergé sur' }],
  },
  {
    id: 'portail', floor: 0, name: 'Portail client', type: 'Application',
    col: 0, row: 1, cols: 2, rows: 1,
    fact: 'Exposé sur Internet, version 4.2.',
    links: [{ to: 'q-relation', rel: 'Supporte' }, { to: 'crm', rel: 'Lit dans' }, { to: 'cloud', rel: 'Hébergé sur' }],
  },
  {
    id: 'erp', floor: 0, name: 'ERP Finance', type: 'Application',
    col: 2, row: 0, cols: 2, rows: 2,
    fact: 'Criticité vitale, fin de support en 2028.',
    links: [{ to: 'q-commandes', rel: 'Supporte' }, { to: 'q-compta', rel: 'Supporte' }, { to: 'esb', rel: 'Envoie vers' }, { to: 'srv', rel: 'Hébergé sur' }],
  },
  {
    id: 'sirh', floor: 0, name: 'SIRH Paie', type: 'Application',
    col: 4, row: 0, cols: 2, rows: 1,
    fact: 'Données personnelles, accès restreint.',
    links: [{ to: 'q-paie', rel: 'Supporte' }, { to: 'esb', rel: 'Envoie vers' }],
  },
  {
    id: 'bi', floor: 0, name: 'Entrepôt BI', type: 'Application',
    col: 4, row: 1, cols: 2, rows: 1,
    fact: 'Alimenté chaque nuit par 9 flux.',
    links: [{ to: 'q-pilotage', rel: 'Supporte' }, { to: 'esb', rel: 'Reçoit de' }],
  },
  {
    id: 'esb', floor: 0, name: "Bus d'échanges", type: 'Interface',
    col: 0, row: 2, cols: 6, rows: 1,
    fact: '46 flux, dont 7 vers des partenaires.',
    links: [{ to: 'q-echanges', rel: 'Supporte' }, { to: 'crm', rel: 'Reçoit de' }, { to: 'erp', rel: 'Reçoit de' }, { to: 'sirh', rel: 'Reçoit de' }, { to: 'mdm', rel: 'Alimente' }, { to: 'bi', rel: 'Alimente' }],
  },
  {
    id: 'mdm', floor: 0, name: 'Référentiel clients', type: 'Application',
    col: 0, row: 3, cols: 2, rows: 1,
    fact: 'Synchronisé en continu avec le CRM.',
    links: [{ to: 'q-donnees', rel: 'Supporte' }, { to: 'esb', rel: 'Reçoit de' }, { to: 'srv', rel: 'Hébergé sur' }],
  },
  {
    id: 'srv', floor: 0, name: 'srv-app-01', type: 'Serveur',
    col: 2, row: 3, cols: 2, rows: 1,
    fact: 'Datacenter Nord, PRA testé en mars.',
    links: [{ to: 'erp', rel: 'Héberge' }, { to: 'mdm', rel: 'Héberge' }],
  },
  {
    id: 'cloud', floor: 0, name: 'Cloud EU', type: 'Infrastructure',
    col: 4, row: 3, cols: 2, rows: 1,
    fact: 'Hébergement en Europe, conforme RGPD.',
    links: [{ to: 'crm', rel: 'Héberge' }, { to: 'portail', rel: 'Héberge' }],
  },
]

export const roomById = new Map(rooms.map((r) => [r.id, r]))

export function ref(room: Room): string {
  return `${COL_LETTERS[room.col]}${room.row + 1}`
}

/**
 * Anchor of a room: horizontally centred, and low enough in the room to stay
 * clear of its name and type, which sit in the top-left corner.
 */
export function center(room: Room): { x: number; y: number } {
  const h = room.rows * CELL_H
  return {
    x: (room.col + room.cols / 2) * CELL_W,
    y: room.row * CELL_H + Math.max(h / 2, 86),
  }
}

export function box(room: Room): { x0: number; y0: number; x1: number; y1: number } {
  return {
    x0: room.col * CELL_W,
    y0: room.row * CELL_H,
    x1: (room.col + room.cols) * CELL_W,
    y1: (room.row + room.rows) * CELL_H,
  }
}

type Pt = { x: number; y: number }

// A segment of the grid is blocked when a room spans across it: flux never cross a room.
function hBlocked(i: number, j: number): boolean {
  return rooms.some(
    (r) => r.floor === currentRouteFloor && r.col <= i && r.col + r.cols >= i + 1 && r.row < j && r.row + r.rows > j,
  )
}
function vBlocked(i: number, j: number): boolean {
  return rooms.some(
    (r) => r.floor === currentRouteFloor && r.cols < COLS && r.row <= j && r.row + r.rows >= j + 1 && r.col < i && r.col + r.cols > i,
  )
}
let currentRouteFloor: FloorId = 0

const TURN = 120
// Routes prefer inner gutters to the plan's outer margin.
const OUTER = 600
const outerH = (j: number) => (j === 0 || j === ROWS ? OUTER : 0)
const outerV = (i: number) => (i === 0 || i === COLS ? OUTER : 0)

/**
 * Route a flux from room a to room b along the gutters between rooms
 * (Dijkstra on the grid lines, with a penalty per bend).
 * Leaves a by its top or bottom edge and enters b the same way.
 */
export function route(a: Room, b: Room): { d: string; end: Pt } {
  currentRouteFloor = a.floor
  const ac = center(a)
  const bc = center(b)
  const key = (i: number, j: number) => `${i},${j}`
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const queue: { i: number; j: number; c: number; dir: string }[] = []
  const exitX = new Map<string, number>()

  for (const j of [a.row, a.row + a.rows]) {
    for (let i = a.col; i <= a.col + a.cols; i++) {
      const c = Math.abs(j * CELL_H - ac.y) + Math.abs(i * CELL_W - ac.x) + (i * CELL_W === ac.x ? 0 : TURN)
      const k = key(i, j)
      if (c < (dist.get(k) ?? Infinity)) {
        dist.set(k, c)
        prev.set(k, null)
        queue.push({ i, j, c, dir: 'h' })
      }
    }
  }
  // Side exits: leave horizontally from the anchor, then follow the side gutter.
  for (const i of [a.col, a.col + a.cols]) {
    if (i === 0 || i === COLS) continue
    for (let j = a.row; j <= a.row + a.rows; j++) {
      const c = Math.abs(i * CELL_W - ac.x) + Math.abs(j * CELL_H - ac.y) + TURN
      const k = key(i, j)
      if (c < (dist.get(k) ?? Infinity)) {
        dist.set(k, c)
        prev.set(k, null)
        exitX.set(k, i * CELL_W)
        queue.push({ i, j, c, dir: 'v' })
      }
    }
  }

  const targets = new Map<string, number>()
  for (const j of [b.row, b.row + b.rows]) {
    for (let i = b.col; i <= b.col + b.cols; i++) {
      targets.set(key(i, j), Math.abs(i * CELL_W - bc.x) + (i * CELL_W === bc.x ? 0 : TURN))
    }
  }

  let best: { k: string; c: number } | null = null
  while (queue.length) {
    queue.sort((p, q) => p.c - q.c)
    const cur = queue.shift()!
    const k = key(cur.i, cur.j)
    if (cur.c > (dist.get(k) ?? Infinity)) continue
    const t = targets.get(k)
    if (t !== undefined && (!best || cur.c + t < best.c)) best = { k, c: cur.c + t }
    const steps: [number, number, string, boolean][] = [
      [cur.i + 1, cur.j, 'h', cur.i + 1 <= COLS && !hBlocked(cur.i, cur.j)],
      [cur.i - 1, cur.j, 'h', cur.i - 1 >= 0 && !hBlocked(cur.i - 1, cur.j)],
      [cur.i, cur.j + 1, 'v', cur.j + 1 <= ROWS && !vBlocked(cur.i, cur.j)],
      [cur.i, cur.j - 1, 'v', cur.j - 1 >= 0 && !vBlocked(cur.i, cur.j - 1)],
    ]
    for (const [ni, nj, dir, ok] of steps) {
      if (!ok) continue
      const len = (dir === 'h' ? CELL_W + outerH(cur.j) : CELL_H + outerV(cur.i))
      const nc = cur.c + len + (dir !== cur.dir ? TURN : 0)
      const nk = key(ni, nj)
      if (nc < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nc)
        prev.set(nk, k)
        queue.push({ i: ni, j: nj, c: nc, dir })
      }
    }
  }

  const nodes: Pt[] = []
  let startKey = ''
  for (let k: string | null | undefined = best?.k; k; k = prev.get(k)) {
    const [i, j] = k.split(',').map(Number)
    nodes.unshift({ x: i * CELL_W, y: j * CELL_H })
    startKey = k
  }
  if (!nodes.length) return { d: `M${ac.x} ${ac.y}L${bc.x} ${bc.y}`, end: bc }

  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const side = exitX.get(startKey)
  const lead: Pt[] = side !== undefined ? [ac, { x: side, y: ac.y }] : [ac, { x: ac.x, y: first.y }]
  const pts: Pt[] = [...lead, ...nodes, { x: bc.x, y: last.y }]
  const clean = pts.filter((p, n) => n === 0 || p.x !== pts[n - 1].x || p.y !== pts[n - 1].y)
  // drop collinear points
  const simple = clean.filter((p, n) => {
    if (n === 0 || n === clean.length - 1) return true
    const a0 = clean[n - 1]
    const a1 = clean[n + 1]
    return !((a0.x === p.x && p.x === a1.x) || (a0.y === p.y && p.y === a1.y))
  })
  const end = { x: bc.x, y: last.y }
  return { d: 'M' + simple.map((p) => `${p.x} ${p.y}`).join('L'), end }
}
