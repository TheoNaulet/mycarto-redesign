<script setup lang="ts">
/**
 * The SI drawn in the five layers myCarto recommends, as stacked isometric plates.
 * A dotted chain runs from a strategic objective down to a server: one referential, every layer linked.
 */
import { layers } from '../../data/product'
import { vDraw } from '../../motion/draw'

type Pt = [number, number]

const CX = 200
const W = 340
const H = 128
const GAP = 92
const TOP = 82
const THICK = 9

const tones = ['yellow', 'paper', 'cool', 'paper', 'navy'] as const

/** Tiles on each plate, in plate coordinates (u, v, size). `hot` is the one the chain goes through. */
const tiles: { u: number; v: number; s: number; tone: 'navy' | 'blue' | 'yellow' | 'paper'; hot?: boolean }[][] = [
  [
    { u: 0.2, v: 0.38, s: 0.2, tone: 'navy', hot: true },
    { u: 0.52, v: 0.5, s: 0.16, tone: 'navy' },
  ],
  [
    { u: 0.08, v: 0.36, s: 0.17, tone: 'blue' },
    { u: 0.34, v: 0.42, s: 0.17, tone: 'blue', hot: true },
    { u: 0.6, v: 0.48, s: 0.17, tone: 'blue' },
  ],
  [
    { u: 0.12, v: 0.5, s: 0.15, tone: 'navy' },
    { u: 0.36, v: 0.36, s: 0.19, tone: 'navy', hot: true },
    { u: 0.62, v: 0.48, s: 0.15, tone: 'navy' },
  ],
  [
    { u: 0.08, v: 0.5, s: 0.15, tone: 'blue' },
    { u: 0.3, v: 0.36, s: 0.19, tone: 'yellow', hot: true },
    { u: 0.56, v: 0.4, s: 0.15, tone: 'blue' },
    { u: 0.44, v: 0.66, s: 0.15, tone: 'blue' },
  ],
  [
    { u: 0.14, v: 0.44, s: 0.17, tone: 'paper' },
    { u: 0.4, v: 0.4, s: 0.19, tone: 'paper', hot: true },
    { u: 0.64, v: 0.5, s: 0.15, tone: 'paper' },
  ],
]

function corners(i: number) {
  const y = TOP + i * GAP
  const L: Pt = [CX - W / 2, y]
  const T: Pt = [CX, y - H / 2]
  const R: Pt = [CX + W / 2, y]
  const B: Pt = [CX, y + H / 2]
  return { L, T, R, B, y }
}

/** Plate coordinates to screen: u runs from the left corner to the top one, v from the left corner to the bottom one. */
function at(i: number, u: number, v: number): Pt {
  const { L, T, B } = corners(i)
  return [L[0] + u * (T[0] - L[0]) + v * (B[0] - L[0]), L[1] + u * (T[1] - L[1]) + v * (B[1] - L[1])]
}

const pts = (list: Pt[]) => list.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')

function plate(i: number) {
  const { L, T, R, B } = corners(i)
  const d = (p: Pt): Pt => [p[0], p[1] + THICK]
  return {
    top: pts([L, T, R, B]),
    left: pts([L, B, d(B), d(L)]),
    right: pts([B, R, d(R), d(B)]),
  }
}

function tile(i: number, t: { u: number; v: number; s: number }) {
  const lift = 7
  const up = (p: Pt): Pt => [p[0], p[1] - lift]
  const a = at(i, t.u, t.v)
  const b = at(i, t.u + t.s, t.v)
  const c = at(i, t.u + t.s, t.v + t.s)
  const d = at(i, t.u, t.v + t.s)
  return {
    top: pts([up(a), up(b), up(c), up(d)]),
    sideL: pts([up(a), up(d), d, a]),
    sideR: pts([up(d), up(c), c, d]),
    center: at(i, t.u + t.s / 2, t.v + t.s / 2).map((n, k) => (k === 1 ? n - lift : n)) as Pt,
  }
}

const plates = layers.map((name, i) => ({ name, i, tone: tones[i], shape: plate(i), y: corners(i).y }))

const chain = tiles.map((row, i) => tile(i, row.find((t) => t.hot)!).center)

// Draw from the bottom plate up, so each plate covers the back corner of the one under it.
const order = [...plates].reverse()
</script>

<template>
  <svg v-draw class="layers" viewBox="0 0 560 520" role="img" aria-labelledby="layers-desc">
    <desc id="layers-desc">
      Le système d’information en cinq couches empilées : stratégie, métier, fonctionnel, applicatif et
      infrastructure. Un lien en pointillés relie un objectif stratégique à un processus, une fonction, une
      application puis un serveur.
    </desc>
    <g v-for="(p, k) in order" :key="p.name" :class="`plate plate--${p.tone}`" :style="{ '--i': k }">
      <polygon class="plate__side" :points="p.shape.left" />
      <polygon class="plate__side" :points="p.shape.right" />
      <polygon class="plate__top" :points="p.shape.top" />
      <g v-for="(t, k) in tiles[p.i]" :key="k" :class="`tile tile--${t.tone}`">
        <polygon class="tile__side" :points="tile(p.i, t).sideL" />
        <polygon class="tile__side" :points="tile(p.i, t).sideR" />
        <polygon class="tile__top" :points="tile(p.i, t).top" />
      </g>
    </g>

    <polyline class="chain" :points="pts(chain)" />
    <circle v-for="(c, k) in chain" :key="k" class="chain__dot" :cx="c[0]" :cy="c[1]" r="5" :style="{ '--i': k }" />

    <g v-for="p in plates" :key="`l-${p.name}`" class="label" :style="{ '--i': 4 - p.i }">
      <line :x1="CX + W / 2 + 6" :y1="p.y" :x2="CX + W / 2 + 26" :y2="p.y" />
      <text :x="CX + W / 2 + 34" :y="p.y + 6">{{ p.name }}</text>
    </g>
  </svg>
</template>

<style scoped>
.layers {
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: var(--font-display);
}

.plate__top {
  stroke: var(--navy);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.plate__side {
  fill: var(--navy);
  stroke: var(--navy);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.plate--yellow .plate__top {
  fill: var(--yellow);
}

.plate--paper .plate__top {
  fill: var(--paper);
}

.plate--cool .plate__top {
  fill: var(--paper-cool);
}

.plate--navy .plate__top {
  fill: var(--navy);
}

.plate--navy .plate__side {
  fill: var(--navy-deep);
}

.tile__top,
.tile__side {
  stroke: var(--navy);
  stroke-width: 2;
  stroke-linejoin: round;
}

.tile__side {
  fill: var(--navy);
}

.tile--navy .tile__top {
  fill: var(--navy);
}

.tile--navy .tile__side {
  fill: var(--navy-deep);
}

.tile--blue .tile__top {
  fill: var(--blue);
}

.tile--yellow .tile__top {
  fill: var(--yellow);
}

.tile--paper .tile__top {
  fill: var(--paper);
}

.plate--navy .tile__top,
.plate--navy .tile__side {
  stroke: var(--paper);
}

.plate--navy .tile__side {
  fill: var(--paper-cool);
}

.chain {
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-dasharray: 2 7;
  stroke-linecap: round;
}

.chain__dot {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3;
}

/* The stack builds from the infrastructure up, then the chain is pinned from the objective down. */
.plate,
.label {
  transition:
    transform 0.6s var(--ease-out) calc(0.1s + var(--i) * 110ms),
    opacity 0.35s linear calc(0.1s + var(--i) * 110ms);
}

.chain {
  transition: opacity 0.4s linear 0.85s;
}

.chain__dot {
  transform-box: fill-box;
  transform-origin: center;
  transition:
    scale 0.4s var(--ease-out) calc(0.9s + var(--i) * 100ms),
    opacity 0.2s linear calc(0.9s + var(--i) * 100ms);
}

.layers[data-draw]:not(.is-drawn) .plate,
.layers[data-draw]:not(.is-drawn) .label {
  opacity: 0;
  transform: translateY(-28px);
}

.layers[data-draw]:not(.is-drawn) .chain {
  opacity: 0;
}

.layers[data-draw]:not(.is-drawn) .chain__dot {
  opacity: 0;
  scale: 0;
}

.label line {
  stroke: var(--navy);
  stroke-width: 2;
}

.label text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 21px;
}
</style>
