<script setup lang="ts">
/**
 * Their pricing argument drawn: the SI grows faster than the team, and the price follows the team.
 * Illustrative shapes only, no real figures.
 */
const apps = [64, 104, 150, 204, 262]
const users = [58, 63, 69, 73, 78]

const X0 = 44
const BASE = 330
const STEP = 92
const BAR = 46

const userPts = users.map((u, i) => [X0 + i * STEP + BAR / 2, BASE - u] as const)
const line = userPts.map((p) => p.join(',')).join(' ')
const last = userPts[userPts.length - 1]
</script>

<template>
  <figure class="chart">
    <svg viewBox="0 0 500 380" role="img" aria-labelledby="chart-desc">
      <desc id="chart-desc">
        Illustration : d’année en année, le nombre d’applications cartographiées grandit vite, celui des
        utilisateurs presque pas. Le prix de myCarto suit les utilisateurs.
      </desc>
      <g class="legend">
        <rect x="44" y="18" width="18" height="18" rx="4" class="bar" />
        <text x="72" y="33">Applications cartographiées</text>
        <line x1="44" y1="60" x2="62" y2="60" class="users" />
        <text x="72" y="66">Utilisateurs, donc votre budget</text>
      </g>
      <line class="axis" :x1="X0 - 14" :y1="BASE" x2="486" :y2="BASE" />
      <rect
        v-for="(a, i) in apps"
        :key="i"
        class="bar"
        :x="X0 + i * STEP"
        :y="BASE - a"
        :width="BAR"
        :height="a"
        rx="6"
      />
      <polyline class="users" :points="line" />
      <circle v-for="(p, i) in userPts" :key="i" class="users__dot" :cx="p[0]" :cy="p[1]" r="7" />
      <g class="tag">
        <rect :x="last[0] - 128" :y="last[1] - 58" width="112" height="34" rx="17" />
        <text :x="last[0] - 72" :y="last[1] - 35">Votre prix</text>
      </g>
      <g class="years">
        <text v-for="(_, i) in apps" :key="i" :x="X0 + i * STEP + BAR / 2" :y="BASE + 28">Année {{ i + 1 }}</text>
      </g>
    </svg>
    <figcaption>Votre SI grandit plus vite que vos équipes. Illustration du principe, sans chiffres réels.</figcaption>
  </figure>
</template>

<style scoped>
.chart {
  margin: 0;
  padding: var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

svg {
  width: 100%;
  height: auto;
  font-family: var(--font-display);
}

.bar {
  fill: var(--navy);
}

.users {
  fill: none;
  stroke: var(--yellow);
  stroke-width: 7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.users__dot {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 3;
}

.axis {
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linecap: round;
}

.legend text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 19px;
}

.tag rect {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 2.5;
}

.tag text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 17px;
  text-anchor: middle;
}

.years text {
  fill: var(--text-muted);
  font-family: var(--font-text);
  font-size: 16px;
  text-anchor: middle;
}

figcaption {
  margin-top: var(--space-3);
  font-size: var(--fs-s);
  color: var(--text-muted);
}
</style>
