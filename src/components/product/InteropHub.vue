<script setup lang="ts">
/**
 * myCarto at the hub of the tools it exchanges with, through its REST API.
 * The tools sit evenly on a circle. On arrival (v-draw) each dashed link grows out of myCarto,
 * then its tool lands at the end of it, one after the other. With reduced motion, all is shown at once.
 * Drawn for a yellow or paper ground.
 */
import { vDraw } from '../../motion/draw'
import BrandLogo from '../BrandLogo.vue'

const props = withDefaults(defineProps<{ systems?: string[] }>(), {
  systems: () => ['CMDB', 'ITSM', 'PPM', 'BI', 'SI Finances', 'Connaissances', 'LDAP'],
})

/** Position of tool i on the circle around myCarto, in % of the hub box. */
function pos(i: number) {
  const angle = (i / props.systems.length) * Math.PI * 2 - Math.PI / 2
  return { x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 }
}
</script>

<template>
  <div v-draw class="hub" role="img" :aria-label="`myCarto relié à ${systems.join(', ')}`">
    <svg class="hub__lines" viewBox="0 0 100 100" aria-hidden="true">
      <line
        v-for="(s, i) in systems"
        :key="s"
        x1="50"
        y1="50"
        :x2="pos(i).x"
        :y2="pos(i).y"
        :style="{ '--i': i }"
      />
    </svg>
    <span
      v-for="(s, i) in systems"
      :key="s"
      class="hub__node"
      :style="{ left: `${pos(i).x}%`, top: `${pos(i).y}%`, '--i': i }"
      aria-hidden="true"
      >{{ s }}</span
    >
    <span class="hub__core" aria-hidden="true">
      <BrandLogo class="hub__logo" />
      <span>API REST</span>
    </span>
  </div>
</template>

<style scoped>
.hub {
  position: relative;
  width: 100%;
  max-width: 34rem;
  aspect-ratio: 1;
  justify-self: center;
}

.hub__lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.hub__lines line {
  stroke: var(--navy);
  stroke-width: 0.6;
  stroke-dasharray: 1.6 1.2;
  /* Each link grows out of myCarto, then its tool lands at the end of it. */
  transform-box: view-box;
  transform-origin: 50% 50%;
  transition: transform 0.55s var(--ease-out) calc(0.25s + var(--i) * 80ms);
}

.hub[data-draw]:not(.is-drawn) .hub__lines line {
  transform: scale(0);
}

.hub[data-draw]:not(.is-drawn) .hub__node {
  opacity: 0;
  scale: 0.6;
}

.hub[data-draw]:not(.is-drawn) .hub__core {
  opacity: 0;
  scale: 0.85;
}

.hub__node {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 0.65rem 1.15rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  white-space: nowrap;
  transition:
    opacity 0.3s var(--ease-out) calc(0.55s + var(--i) * 80ms),
    scale 0.45s var(--ease-out) calc(0.55s + var(--i) * 80ms);
}

.hub__core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  align-content: center;
  gap: var(--space-2);
  width: 42%;
  aspect-ratio: 1;
  border: var(--frame) solid var(--navy);
  border-radius: 50%;
  background: var(--paper);
  transition:
    opacity 0.4s var(--ease-out),
    scale 0.5s var(--ease-out);
}

.hub__core .hub__logo {
  width: 72%;
  height: auto;
}

.hub__core span {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  color: var(--navy);
}

@media (--bp-xs) {
  .hub__node {
    padding: 0.45rem 0.7rem;
    font-size: var(--fs-xs);
  }
}
</style>
