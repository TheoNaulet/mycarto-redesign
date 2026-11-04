<script setup lang="ts">
// A flat illustration of a generated map (a POS of a fictional SI), drawn in the brand's flat style.
const zones = [
  { name: 'Pilotage', x: 24, y: 84, w: 552, h: 82, fill: '#fbf1c6', blocks: [[44, 116], [164, 116], [284, 116], [404, 116]] },
  { name: 'Métier', x: 24, y: 180, w: 356, h: 150, fill: '#eef1f5', blocks: [[44, 212], [164, 212], [284, 212], [44, 270], [164, 270]] },
  { name: 'Support', x: 394, y: 180, w: 182, h: 150, fill: '#e1edf8', blocks: [[414, 212], [414, 270]] },
]
</script>

<template>
  <svg class="map-illu" viewBox="0 0 600 440" role="img" aria-label="Illustration : une carte du SI générée par myCarto, rangée par zones">
    <!-- window -->
    <rect x="1.5" y="1.5" width="597" height="437" rx="18" fill="#fff" stroke="#262e6f" stroke-width="3" />
    <path d="M1.5 54V20A18.5 18.5 0 0 1 20 1.5h560A18.5 18.5 0 0 1 598.5 20v34z" fill="#262e6f" />
    <text x="26" y="35" class="t-brand">myCarto</text>
    <g class="tabs">
      <rect x="392" y="15" width="56" height="24" rx="12" fill="#fac130" />
      <text x="420" y="32" fill="#262e6f">POS</text>
      <text x="482" y="32" fill="#fff">Flux</text>
      <text x="544" y="32" fill="#fff">Infra</text>
    </g>

    <!-- zones -->
    <g v-for="z in zones" :key="z.name">
      <rect :x="z.x" :y="z.y" :width="z.w" :height="z.h" rx="12" :fill="z.fill" />
      <text :x="z.x + 16" :y="z.y + 22" class="t-zone">{{ z.name }}</text>
      <rect
        v-for="(b, i) in z.blocks"
        :key="i"
        :x="b[0]"
        :y="b[1]"
        width="104"
        height="40"
        rx="8"
        fill="#fff"
        stroke="#262e6f"
        stroke-width="2"
      />
    </g>

    <!-- référentiels -->
    <rect x="24" y="344" width="552" height="74" rx="12" fill="#262e6f" />
    <text x="40" y="366" class="t-zone" fill="#fff">Référentiels</text>
    <rect v-for="x in [40, 172, 304, 436]" :key="x" :x="x" y="376" width="120" height="28" rx="7" fill="#fff" opacity="0.92" />

    <!-- flux -->
    <g fill="none" stroke="#398acb" stroke-width="3" stroke-linecap="round">
      <path d="M96 252v18" />
      <path d="M216 252v18" />
      <path d="M388 232h26" />
      <path d="M336 156v56" />
      <path d="M466 310v66" />
      <path d="M96 310v66" />
    </g>

    <!-- the obsolete application, highlighted -->
    <rect x="284" y="212" width="104" height="40" rx="8" fill="#fac130" stroke="#262e6f" stroke-width="2.5" />
    <g transform="translate(372 196)">
      <circle r="13" fill="#262e6f" />
      <path d="M0-6v7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" />
      <circle cy="6" r="1.6" fill="#fff" />
    </g>
  </svg>
</template>

<style scoped>
.map-illu {
  display: block;
  width: 100%;
  height: auto;
  font-family: var(--font-display);
}

.t-brand {
  fill: #fff;
  font-weight: 700;
  font-size: 20px;
}

.tabs text {
  font-weight: 700;
  font-size: 13px;
  text-anchor: middle;
}

.t-zone {
  fill: #262e6f;
  font-weight: 700;
  font-size: 14px;
}
</style>
