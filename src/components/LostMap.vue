<script setup lang="ts">
/**
 * The 404 drawing: a small SI map, drawn flat like the site's other schemas, and a dashed route
 * that leaves it and ends on a yellow pin off the map. Same motion idea as everywhere else:
 * the map's links trace themselves, then the route, then the pin lands.
 * It follows its ground: navy ink on light grounds, white inside `.on-navy`.
 */
import { useId } from 'vue'
import { vDraw } from '../motion/draw'

/** Unique per instance: a docs page shows several maps at once. */
const maskId = `lost-route-${useId()}`

/** The known territory: plates of the map (x, y = top-left corner, 96 × 44). */
const plates = [
  { x: 24, y: 28 },
  { x: 176, y: 12 },
  { x: 328, y: 44 },
  { x: 40, y: 148 },
  { x: 200, y: 132 },
  { x: 120, y: 252 },
]
const W = 96
const H = 44
const c = (i: number) => ({ x: plates[i].x + W / 2, y: plates[i].y + H / 2 })
const links = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 4],
  [3, 4],
  [3, 5],
  [4, 5],
].map(([a, b]) => ({ a: c(a), b: c(b) }))

/** The route wanders out of the map from the plate in the middle, to the pin. */
const route = 'M 296 154 C 360 160, 400 196, 380 244 S 300 300, 340 330 S 420 352, 428 316'
</script>

<template>
  <svg v-draw class="lost" viewBox="0 0 480 400" role="img" aria-label="Une carte du SI, et un chemin qui en sort vers un point inconnu">
    <defs>
      <mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="400">
        <path class="lost__reveal" :d="route" pathLength="1" />
      </mask>
    </defs>

    <g class="lost__links">
      <line
        v-for="(l, i) in links"
        :key="i"
        :x1="l.a.x"
        :y1="l.a.y"
        :x2="l.b.x"
        :y2="l.b.y"
        pathLength="1"
        :style="{ '--i': i }"
      />
    </g>

    <g class="lost__plates">
      <g v-for="(p, i) in plates" :key="i" :style="{ '--i': i }" class="lost__plate">
        <rect :x="p.x" :y="p.y" :width="W" :height="H" rx="10" />
        <line :x1="p.x + 16" :y1="p.y + 18" :x2="p.x + W - 28" :y2="p.y + 18" />
        <line :x1="p.x + 16" :y1="p.y + 28" :x2="p.x + W - 44" :y2="p.y + 28" />
      </g>
    </g>

    <path class="lost__route" :d="route" :mask="`url(#${maskId})`" />

    <g class="lost__pin" transform="translate(428 316)">
      <g class="lost__pin-body">
        <path d="M 0 0 C -6 -14, -26 -26, -26 -46 A 26 26 0 1 1 26 -46 C 26 -26, 6 -14, 0 0 Z" />
        <text x="0" y="-37" text-anchor="middle">404</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.lost {
  --ink: var(--navy);
  --plate: var(--paper);

  display: block;
  width: 100%;
  max-width: 34rem;
  height: auto;
  margin-inline: auto;
  overflow: visible;
}

.on-navy .lost {
  --ink: var(--on-navy);
  --plate: var(--navy);
}

.lost__links line {
  stroke: var(--ink);
  stroke-width: 3;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--dur-draw) var(--ease-draw) calc(var(--i) * var(--stagger));
}

.lost__plate rect {
  fill: var(--plate);
  stroke: var(--ink);
  stroke-width: var(--frame);
}

.lost__plate line {
  stroke: var(--ink);
  stroke-width: 4;
  stroke-linecap: round;
  opacity: 0.35;
}

.lost__plate {
  transition: opacity 0.4s var(--ease-out) calc(var(--i) * var(--stagger));
}

.lost__route {
  fill: none;
  stroke: var(--yellow);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 2 12;
}

.lost__reveal {
  fill: none;
  stroke: #fff;
  stroke-width: 12;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1.4s var(--ease-draw) 0.8s;
}

.lost__pin-body {
  transition:
    opacity 0.3s var(--ease-out) 2.1s,
    transform 0.5s var(--ease-out) 2.1s;
}

.lost__pin-body path {
  fill: var(--yellow);
}

.lost__pin-body text {
  fill: var(--navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
}

/* Start state, set by v-draw; the end state is the default above. */
.lost[data-draw]:not(.is-drawn) .lost__links line,
.lost[data-draw]:not(.is-drawn) .lost__reveal {
  stroke-dashoffset: 1;
}

.lost[data-draw]:not(.is-drawn) .lost__plate {
  opacity: 0;
}

.lost[data-draw]:not(.is-drawn) .lost__pin-body {
  opacity: 0;
  transform: translateY(-18px);
}
</style>
