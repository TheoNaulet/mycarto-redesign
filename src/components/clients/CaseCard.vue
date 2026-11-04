<script setup lang="ts">
import type { CaseStudy } from '../../data/cases'

defineProps<{ study: CaseStudy }>()
</script>

<template>
  <RouterLink class="card" :to="`/clients/${study.slug}`">
    <span class="card__visual">
      <img v-if="study.cover" :src="study.cover" alt="" width="1100" height="600" loading="lazy" />
      <img v-else class="card__logo" :src="study.logo" alt="" loading="lazy" />
    </span>
    <span class="card__body">
      <span class="card__org">{{ study.org }}</span>
      <span class="card__figure">{{ study.card.figure }}</span>
      <span class="card__line">{{ study.card.line }}</span>
      <span class="card__go">Lire le cas client</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  height: 100%;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--paper);
  color: var(--text);
  text-decoration: none;
}

.card__visual {
  display: grid;
  place-items: center;
  min-height: 13rem;
  background: var(--paper-cool);
  overflow: hidden;
}

.card__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Their covers carry the client logo on the left. */
  object-position: left center;
  transition: transform 0.35s var(--ease-out);
}

.card__visual .card__logo {
  width: 70%;
  height: auto;
  max-height: 60%;
  object-fit: contain;
}

.card:hover .card__visual img {
  transform: scale(1.03);
}

.card__body {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
}

.card__org {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--navy);
}

.card__figure {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.15;
  color: var(--navy);
}

.card__line {
  font-size: var(--fs-s);
  line-height: 1.5;
}

.card__go {
  margin-top: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  color: var(--navy);
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.3em;
}

.card:hover .card__go {
  text-decoration-color: var(--navy);
}

@media (max-width: 640px) {
  .card {
    grid-template-columns: 1fr;
  }

  .card__visual {
    min-height: 0;
    aspect-ratio: 16 / 9;
  }

  .card__body {
    padding: var(--space-5);
  }
}
</style>
