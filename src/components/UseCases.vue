<script setup lang="ts">
import { directions } from '../data/content'
</script>

<template>
  <section id="usages" class="section" aria-labelledby="usages-title">
    <div class="wrap split">
      <div class="section-head">
        <h2 id="usages-title">Les DSI s’en servent pour</h2>
        <p>Un seul référentiel, trois façons de décider.</p>
      </div>
      <dl class="frame">
        <div v-for="d in directions" :key="d.id" class="frame-row">
          <dt class="frame-row__title">
            <img :src="`/brand/photos/${d.photo}.webp`" alt="" width="112" height="112" />
            {{ d.name }}
          </dt>
          <dd class="frame-row__text">{{ d.line }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
img {
  width: 7rem;
  height: 7rem;
  flex: none;
  object-fit: contain;
}

@media (max-width: 720px) {
  img {
    width: 5rem;
    height: 5rem;
  }

  .frame-row__text {
    padding-left: calc(5rem + var(--space-4));
  }
}
</style>
