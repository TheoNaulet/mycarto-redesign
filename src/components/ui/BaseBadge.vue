<script setup lang="ts">
/**
 * A short fact in a pill: a date, a sector, a framework, « Vous êtes ici ».
 * - navy: the default, on paper, grey and yellow grounds. Inside `.on-navy` it turns white.
 * - yellow: to stand out, on paper or navy.
 * - outline: the secondary fact beside a filled one (the place next to the date).
 * `as` sets the element (span by default, `li` in a list, `time` for a date); other attributes pass through.
 * It states a fact and is never clickable: actions are BaseButton, filters are the chips of the page.
 */
withDefaults(
  defineProps<{
    tone?: 'navy' | 'yellow' | 'outline'
    size?: 's' | 'm'
    as?: string
  }>(),
  { tone: 'navy', size: 'm', as: 'span' },
)
</script>

<template>
  <component :is="as" class="badge" :class="[`badge--${tone}`, `badge--${size}`]">
    <slot />
  </component>
</template>

<style scoped>
.badge {
  display: inline-block;
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1.2;
}

.badge--m {
  padding: 0.45rem 1rem;
}

.badge--s {
  padding: 0.3rem 0.75rem;
}

.badge--navy {
  background: var(--navy);
  color: var(--on-navy);
}

.badge--yellow {
  background: var(--yellow);
  color: var(--navy);
}

.badge--outline {
  border-color: currentColor;
  color: var(--navy);
}

.on-navy .badge--navy {
  background: var(--paper);
  color: var(--navy);
}

.on-navy .badge--outline {
  color: var(--on-navy);
}
</style>
