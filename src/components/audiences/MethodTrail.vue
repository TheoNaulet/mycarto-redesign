<script setup lang="ts">
import type { MethodStep } from '../../data/audiences'
import { vDraw } from '../../motion/draw'

/**
 * The method drawn as a trail on their yellow ground: a white road with a navy centre line
 * winding over three rows (cadrer, construire, faire vivre), one numbered waypoint per step.
 * Each waypoint links to its step further down the page.
 */
const props = defineProps<{ steps: MethodStep[] }>()

// Waypoint positions in the 760 × 520 drawing, row by row along the road.
const spots = [
  [130, 110], [300, 110], [470, 110], [630, 110],
  [590, 270], [380, 270], [170, 270],
  [190, 430], [400, 430], [610, 430],
]

const road = 'M40 110H660A80 80 0 0 1 660 270H100A80 80 0 0 0 100 430H700'
const points = props.steps.map((s, i) => ({ ...s, x: spots[i][0], y: spots[i][1] }))
</script>

<template>
  <figure v-draw class="trail">
    <svg viewBox="0 0 760 520" role="group" aria-label="Les 10 points de passage de la démarche">
      <path class="trail__road" :d="road" pathLength="1" />
      <path class="trail__line" :d="road" />

      <g class="trail__start" aria-hidden="true">
        <circle cx="40" cy="110" r="11" />
        <text x="40" y="78">Départ</text>
      </g>
      <g class="trail__end" aria-hidden="true">
        <path d="M700 430V368" />
        <path class="trail__flag" d="M700 368h36l-9 12 9 12h-36z" />
      </g>

      <a
        v-for="(p, i) in points"
        :key="p.n"
        class="stop"
        :href="`#etape-${p.n}`"
        :aria-label="`Étape ${p.n} ${p.short} : ${p.name}`"
        :style="{ '--i': i }"
      >
        <circle :cx="p.x" :cy="p.y" r="25" />
        <!-- One text with a real space, so the link reads « 1 Objectifs », not « 1Objectifs ». -->
        <text text-anchor="middle">
          <tspan class="stop__n" :x="p.x" :y="p.y + 7">{{ p.n }}</tspan>{{ ' ' }}<tspan class="stop__label" :x="p.x" :y="p.y + 52">{{ p.short }}</tspan>
        </text>
      </a>
    </svg>
  </figure>
</template>

<style scoped>
.trail {
  margin: 0;
  padding: var(--space-5) var(--space-5) var(--space-3);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
}

.trail svg {
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: var(--font-display);
}

.trail__road {
  fill: none;
  stroke: var(--paper);
  stroke-width: 22;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trail__line {
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-dasharray: 10 10;
  stroke-linecap: round;
}

.trail__start circle {
  fill: var(--navy);
}

.trail__start text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 16px;
  text-anchor: middle;
}

.trail__end path {
  fill: none;
  stroke: var(--navy);
  stroke-width: 4;
  stroke-linecap: round;
}

.trail__end .trail__flag {
  fill: var(--navy);
  stroke-width: 2;
  stroke-linejoin: round;
}

/* The road is laid from the start, each waypoint lands as the road reaches it, the flag goes up last. */
.trail__road {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1.5s var(--ease-draw) 0.15s;
}

.trail__line {
  transition: opacity 0.4s linear 1.4s;
}

.stop {
  transform-box: fill-box;
  transform-origin: 50% 30%;
  transition:
    scale 0.4s var(--ease-out) calc(0.3s + var(--i) * 120ms),
    opacity 0.2s linear calc(0.3s + var(--i) * 120ms);
}

.trail__end {
  transform-box: fill-box;
  transform-origin: 0% 100%;
  transition: scale 0.4s var(--ease-out) 1.55s;
}

.trail[data-draw]:not(.is-drawn) .trail__road {
  stroke-dashoffset: 1;
}

.trail[data-draw]:not(.is-drawn) .trail__line {
  opacity: 0;
}

.trail[data-draw]:not(.is-drawn) .stop {
  opacity: 0;
  scale: 0.4;
}

.trail[data-draw]:not(.is-drawn) .trail__end {
  scale: 0;
}

.stop circle {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3.5;
  transition: fill 0.2s var(--ease-out);
}

.stop__n {
  fill: var(--navy);
  font-weight: 700;
  font-size: 20px;
  text-anchor: middle;
  transition: fill 0.2s var(--ease-out);
}

.stop__label {
  fill: var(--navy);
  font-weight: 700;
  font-size: 16px;
  text-anchor: middle;
}

.stop:hover circle,
.stop:focus-visible circle {
  fill: var(--navy);
}

.stop:hover .stop__n,
.stop:focus-visible .stop__n {
  fill: var(--paper);
}

.stop:focus-visible {
  outline: none;
}

.stop:focus-visible circle {
  stroke: var(--paper);
  stroke-width: 5;
}
</style>
