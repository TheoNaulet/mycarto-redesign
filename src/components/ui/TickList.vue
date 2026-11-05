<script setup lang="ts">
/** Points ticked in a yellow disc, as on the Fonctionnalités page. On yellow, the disc turns white. */
withDefaults(
  defineProps<{
    items: string[]
    ground?: 'light' | 'navy' | 'yellow'
    size?: 'm' | 'l'
  }>(),
  { ground: 'light', size: 'l' },
)
</script>

<template>
  <ul class="ticks" :class="[`ticks--${ground}`, `ticks--${size}`]">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>

<style scoped>
.ticks {
  display: grid;
  gap: var(--space-3);
}

.ticks li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-weight: 500;
  line-height: 1.35;
  color: var(--navy);
}

.ticks--l li {
  font-size: var(--fs-l);
}

.ticks--m li {
  font-size: var(--fs-m);
}

.ticks li::before {
  content: '';
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  margin-top: -0.1rem;
  border-radius: 50%;
  background: var(--yellow)
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="%23262e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    center / 70% no-repeat;
}

.ticks--m li::before {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0;
}

.ticks--yellow li::before {
  background-color: var(--paper);
}

.ticks--navy li {
  color: var(--on-navy);
}

@media (--bp-xs) {
  .ticks--l li {
    font-size: var(--fs-m);
  }
}
</style>
