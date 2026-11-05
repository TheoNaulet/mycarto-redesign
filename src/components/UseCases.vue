<script setup lang="ts">
// Home: the three ways DSI use myCarto, each with its brand persona, linking to /metiers.
import { directions } from '../data/content'
</script>

<template>
  <section id="usages" class="section usages" aria-labelledby="usages-title">
    <div class="wrap">
      <div class="section-head usages__head">
        <h2 id="usages-title">Les DSI s’en servent pour</h2>
        <p>Un seul référentiel, trois façons de décider.</p>
      </div>
      <ul class="usages__list">
        <li v-for="d in directions" :key="d.id">
          <img :src="`/brand/photos/${d.photo}.webp`" alt="" width="512" height="512" />
          <h3>{{ d.name }}</h3>
          <p>{{ d.line }}</p>
        </li>
      </ul>
      <p class="usages__more">
        <RouterLink class="link-more" to="/metiers">Voir myCarto métier par métier</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.usages {
  background: var(--paper-cool);
}

.usages__head {
  margin-inline: auto;
  text-align: center;
}

.usages__head p {
  margin-inline: auto;
}

.usages__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-7);
}

.usages__list img {
  width: 100%;
  max-width: 20rem;
  aspect-ratio: 1;
  height: auto;
  object-fit: contain;
  margin: 0 auto var(--space-4);
}

.usages__list h3 {
  font-size: var(--fs-xl);
  text-align: center;
}

.usages__list p {
  margin: var(--space-2) auto 0;
  max-width: 30ch;
  font-size: var(--fs-s);
  text-align: center;
}

.usages__more {
  margin-top: var(--space-7);
  text-align: center;
  color: var(--navy);
}

@media (--bp-m) {
  .usages__list {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .usages__list img {
    max-width: 16rem;
  }
}
</style>
