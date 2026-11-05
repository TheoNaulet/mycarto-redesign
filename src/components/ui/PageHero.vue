<script setup lang="ts">
/**
 * The opening of every inner page, on the model of the home hero and the Fonctionnalités head:
 * a big title, one line and the actions on the left, the page's own visual on the right.
 * `full` makes it fill the screen under the header; utility pages (legal, FAQ…) leave it off.
 */
withDefaults(
  defineProps<{
    ground?: 'paper' | 'cool' | 'navy' | 'yellow'
    full?: boolean
    titleId?: string
  }>(),
  { ground: 'paper', full: true, titleId: undefined },
)

const slots = defineSlots<{
  title(): unknown
  before?(): unknown
  lede?(): unknown
  actions?(): unknown
  default?(): unknown
  aside?(): unknown
}>()
</script>

<template>
  <header
    class="page-hero"
    :class="[`page-hero--${ground}`, { 'page-hero--full': full, 'on-navy': ground === 'navy' }]"
  >
    <div class="wrap page-hero__grid" :class="{ 'page-hero__grid--solo': !slots.aside }">
      <div class="page-hero__copy">
        <slot name="before" />
        <h1 :id="titleId"><slot name="title" /></h1>
        <p v-if="slots.lede" class="page-hero__lede"><slot name="lede" /></p>
        <div v-if="slots.actions" class="page-hero__actions"><slot name="actions" /></div>
        <slot />
      </div>
      <div v-if="slots.aside" class="page-hero__aside"><slot name="aside" /></div>
    </div>
  </header>
</template>

<style scoped>
.page-hero {
  display: flex;
  align-items: center;
  padding-block: var(--space-8);
}

.page-hero > .wrap {
  width: min(100% - 2 * var(--gutter), var(--max));
}

.page-hero--full {
  min-height: calc(100dvh - 6.8rem);
  padding-block: var(--space-7);
}

.page-hero--cool {
  background: var(--paper-cool);
}

.page-hero--navy {
  background: var(--navy);
}

.page-hero--yellow {
  background: var(--yellow);
}

.page-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr);
  gap: var(--space-8);
  align-items: center;
}

.page-hero__grid--solo {
  grid-template-columns: minmax(0, 1fr);
}

.page-hero__copy h1 {
  font-size: clamp(2.1rem, 0.9rem + 3.6vw, 4.1rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  max-width: 16ch;
}

.page-hero__grid--solo h1 {
  max-width: 20ch;
}

.page-hero__lede {
  margin-top: var(--space-5);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 30ch;
}

.page-hero--yellow .page-hero__lede {
  color: var(--navy);
}

.page-hero--navy .page-hero__lede {
  color: var(--on-navy-soft);
}

.page-hero__grid--solo .page-hero__lede {
  max-width: 44ch;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.page-hero__aside {
  min-width: 0;
}

@media (--bp-l) {
  .page-hero--full {
    min-height: 0;
  }

  .page-hero__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

@media (--bp-xs) {
  .page-hero {
    padding-block: var(--space-7);
  }
}
</style>
