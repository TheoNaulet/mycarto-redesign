<script setup lang="ts">
/**
 * The head of a feature on the Fonctionnalités page: its brand icon in a framed tile, its name, and
 * the one line that says why it matters. The section around it sets the ground; `ground="navy"`
 * turns the frame white and softens the line. Points, visuals and examples follow in the page.
 */
withDefaults(
  defineProps<{
    icon: string
    title: string
    titleId: string
    why: string
    ground?: 'light' | 'navy'
    align?: 'start' | 'center'
  }>(),
  { ground: 'light', align: 'start' },
)
</script>

<template>
  <div class="intro" :class="[`intro--${ground}`, `intro--${align}`]">
    <span class="intro__icon"><img :src="`/brand/features/${icon}.svg`" alt="" width="60" height="60" /></span>
    <h2 :id="titleId">{{ title }}</h2>
    <p class="intro__why">{{ why }}</p>
  </div>
</template>

<style scoped>
.intro--center {
  display: grid;
  justify-items: center;
  text-align: center;
}

.intro__icon {
  display: inline-grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.intro--navy .intro__icon {
  border-color: var(--paper);
}

.intro__icon img {
  width: 3.75rem;
  height: 3.75rem;
}

.intro h2 {
  max-width: 14ch;
  font-size: var(--fs-3xl);
  line-height: 1.04;
  letter-spacing: -0.02em;
}

.intro__why {
  max-width: 26ch;
  margin-top: var(--space-4);
  font-size: var(--fs-xl);
  line-height: 1.3;
}

.intro--navy .intro__why {
  color: var(--on-navy-soft);
}
</style>
