<script setup lang="ts">
/**
 * AB+ Software in Montpellier, and some of its clients across France, drawn as a flat map in the
 * brand's style: a paper France on the yellow ground, a flow from Montpellier to each client city.
 * On arrival (v-draw) Montpellier lands first, then each flow traces itself and its city appears.
 *
 * Only clients whose city is plain from their name are placed (Ville de Lorient, CHU de Lille…).
 * The outline and the cities are real coordinates, projected below; nothing is placed by eye.
 */
import { vDraw } from '../../motion/draw'

type LonLat = [number, number]

/** France's coast and borders, clockwise from Dunkirk, simplified to about a hundred points. */
const mainland: LonLat[] = [
  [2.37, 51.05], [1.85, 50.96], [1.58, 50.87], [1.6, 50.72], [1.56, 50.4], [1.62, 50.2], [1.38, 50.06],
  [1.08, 49.93], [0.37, 49.76], [0.16, 49.69], [0.1, 49.49], [0.23, 49.42], [0.07, 49.36], [-0.25, 49.29],
  [-0.75, 49.35], [-1.1, 49.33], [-1.27, 49.59], [-1.26, 49.69], [-1.62, 49.65], [-1.94, 49.72],
  [-1.88, 49.53], [-1.79, 49.37], [-1.6, 48.84], [-1.51, 48.64], [-1.85, 48.68], [-2.03, 48.65],
  [-2.32, 48.68], [-2.73, 48.54], [-3.05, 48.78], [-3.45, 48.82], [-3.98, 48.72], [-4.55, 48.63],
  [-4.78, 48.36], [-4.55, 48.24], [-4.33, 48.09], [-4.73, 48.04], [-4.37, 47.8], [-3.92, 47.87],
  [-3.37, 47.7], [-3.12, 47.48], [-2.75, 47.5], [-2.51, 47.29], [-2.2, 47.27], [-2.1, 47.11],
  [-2.25, 46.95], [-1.78, 46.5], [-1.15, 46.16], [-1.1, 45.94], [-1.06, 45.57], [-1.2, 45.0],
  [-1.25, 44.63], [-1.25, 44.4], [-1.3, 44.2], [-1.45, 43.65], [-1.56, 43.48], [-1.78, 43.37],
  [-1.24, 43.1], [-0.53, 42.8], [0.0, 42.7], [0.66, 42.8], [1.45, 42.6], [1.95, 42.43], [2.86, 42.46],
  [3.17, 42.44], [3.04, 42.55], [3.04, 42.7], [3.05, 42.91], [3.16, 43.17], [3.47, 43.28], [3.7, 43.4],
  [3.93, 43.53], [4.08, 43.56], [4.43, 43.45], [4.8, 43.37], [5.3, 43.3], [5.54, 43.21], [5.93, 43.1],
  [6.15, 43.05], [6.64, 43.27], [6.74, 43.42], [7.01, 43.55], [7.27, 43.7], [7.5, 43.78], [7.58, 44.13],
  [6.95, 44.4], [7.02, 44.7], [6.72, 44.93], [6.95, 45.25], [6.88, 45.68], [7.04, 45.92], [6.8, 46.39],
  [6.48, 46.4], [6.15, 46.25], [5.96, 46.13], [6.1, 46.4], [6.37, 46.71], [6.48, 46.9], [6.75, 47.06],
  [7.0, 47.35], [7.0, 47.5], [7.59, 47.59], [7.55, 47.75], [7.58, 48.03], [7.8, 48.58], [8.23, 48.97],
  [7.94, 49.04], [7.43, 49.1], [7.07, 49.11], [6.9, 49.2], [6.37, 49.47], [5.8, 49.55], [5.47, 49.5],
  [4.95, 49.79], [4.83, 50.15], [4.18, 49.98], [4.03, 50.32], [3.6, 50.49], [3.15, 50.79], [2.9, 50.69],
  [2.58, 51.0],
]

const corsica: LonLat[] = [
  [9.4, 43.01], [9.47, 42.65], [9.55, 42.1], [9.23, 41.37], [8.8, 41.62], [8.6, 41.92], [8.7, 42.25],
  [8.55, 42.38], [8.95, 42.65], [9.3, 42.7],
]

const home = { name: 'Montpellier', at: [3.88, 43.61] as LonLat }

/** Client cities. `side` puts the label left of, right of or above the dot, clear of its flow. */
const cities: { name: string; clients: string; at: LonLat; side: 'left' | 'right' | 'above' }[] = [
  { name: 'Lille', clients: 'CHU de Lille', at: [3.06, 50.63], side: 'right' },
  { name: 'Rouen', clients: 'Métropole Rouen Normandie, Seine-Maritime', at: [1.1, 49.44], side: 'left' },
  { name: 'Paris', clients: 'RATP, Arts et Métiers, Université Paris-Saclay', at: [2.35, 48.86], side: 'right' },
  { name: 'Strasbourg', clients: 'Eurométropole de Strasbourg', at: [7.75, 48.57], side: 'left' },
  { name: 'Lorient', clients: 'Ville de Lorient', at: [-3.37, 47.75], side: 'right' },
  { name: 'Dijon', clients: 'Dijon Métropole', at: [5.04, 47.32], side: 'right' },
  { name: 'Lyon', clients: 'Région Auvergne-Rhône-Alpes', at: [4.84, 45.76], side: 'right' },
  { name: 'Bordeaux', clients: 'Région Nouvelle-Aquitaine', at: [-0.58, 44.84], side: 'above' },
]

// Equirectangular projection, longitudes shrunk by cos(46.5°) so France keeps its shape.
const K = 50
const COS = Math.cos((46.5 * Math.PI) / 180)
const project = ([lon, lat]: LonLat) => [(lon + 5.2) * K * COS, (51.3 - lat) * K] as const
const outline = (pts: LonLat[]) =>
  `M${pts.map((p) => project(p).map((n) => n.toFixed(1)).join(',')).join('L')}Z`

const [hx, hy] = project(home.at)

/** Each flow bends towards the middle of France, like a route on a map rather than a ruler line. */
const [ox, oy] = project([2.6, 46.8])
const placed = cities.map((c) => {
  const [x, y] = project(c.at)
  const mx = (hx + x) / 2
  const my = (hy + y) / 2
  const cx = mx + (ox - mx) * 0.3
  const cy = my + (oy - my) * 0.3
  return { ...c, x, y, flow: `M${hx.toFixed(1)},${hy.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}` }
})

function labelAt(c: { x: number; y: number; side: 'left' | 'right' | 'above' }) {
  if (c.side === 'above') return { x: c.x, y: c.y - 15, 'text-anchor': 'middle' }
  return { x: c.side === 'right' ? c.x + 13 : c.x - 13, y: c.y + 5, 'text-anchor': c.side === 'right' ? 'start' : 'end' }
}

const label = `Carte de France : AB+ Software à Montpellier, et des clients à ${cities
  .map((c) => `${c.name} (${c.clients})`)
  .join(', ')}.`
</script>

<template>
  <figure class="clients-map" data-no-reveal>
    <svg v-draw class="map" viewBox="0 0 530 505" role="img" :aria-label="label">
      <path class="map__land" :d="outline(mainland)" />
      <path class="map__land" :d="outline(corsica)" />

      <path
        v-for="(c, i) in placed"
        :key="`flow-${c.name}`"
        class="map__flow"
        :d="c.flow"
        pathLength="1"
        :style="{ '--i': i }"
      />

      <g v-for="(c, i) in placed" :key="c.name" class="map__city" :style="{ '--i': i }">
        <circle :cx="c.x" :cy="c.y" r="7" />
        <text v-bind="labelAt(c)">{{ c.name }}</text>
      </g>

      <g class="map__home">
        <circle class="map__home-ring" :cx="hx" :cy="hy" r="17" />
        <circle class="map__home-dot" :cx="hx" :cy="hy" r="7" />
        <rect :x="hx - 74" :y="hy + 24" width="148" height="34" rx="17" />
        <text :x="hx" :y="hy + 46" text-anchor="middle">{{ home.name }}</text>
      </g>
    </svg>
    <figcaption>
      <span class="key key--home">AB+ Software, depuis 2006</span>
      <span class="key key--client">Quelques-uns de nos 200+ clients</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.clients-map {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
}

.map {
  width: 100%;
  height: auto;
  overflow: visible;
}

.map__land {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linejoin: round;
}

.map__flow {
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 1;
  transition: stroke-dashoffset var(--dur-draw) var(--ease-draw) calc(0.35s + var(--i) * var(--stagger));
}

.map__city circle {
  fill: var(--navy);
  stroke: var(--paper);
  stroke-width: 3;
}

.map text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  fill: var(--navy);
  /* A paper halo keeps the names legible where they cross a flow or the coast. */
  paint-order: stroke;
  stroke: var(--paper);
  stroke-width: 5px;
  stroke-linejoin: round;
}

.map__home-ring {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 4;
}

.map__home-dot {
  fill: var(--navy);
}

.map__home rect {
  fill: var(--navy);
}

.map .map__home text {
  fill: var(--on-navy);
  stroke: none;
}

/* Drawing: Montpellier lands, each flow traces out of it, then its city appears at the end. */
.map__home,
.map__city {
  transform-box: fill-box;
  transform-origin: center;
}

.map__home {
  transition:
    opacity 0.35s var(--ease-out),
    scale 0.5s var(--ease-out);
}

.map__city {
  transition:
    opacity 0.3s var(--ease-out) calc(0.35s + var(--dur-draw) * 0.8 + var(--i) * var(--stagger)),
    scale 0.45s var(--ease-out) calc(0.35s + var(--dur-draw) * 0.8 + var(--i) * var(--stagger));
}

.map[data-draw]:not(.is-drawn) .map__flow {
  stroke-dashoffset: 1;
}

.map[data-draw]:not(.is-drawn) .map__home,
.map[data-draw]:not(.is-drawn) .map__city {
  opacity: 0;
  scale: 0.6;
}

.clients-map figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--navy);
}

.key {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.key::before {
  content: '';
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
}

.key--home::before {
  border: 3px solid var(--navy);
  background: var(--yellow);
}

.key--client::before {
  background: var(--navy);
}

/* On a phone the map is shrunk by a third: the names grow to stay legible. */
@media (--bp-xs) {
  .map text {
    font-size: 23px;
  }
}
</style>
