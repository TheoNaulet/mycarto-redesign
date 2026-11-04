<script setup lang="ts">
import { clients } from '../data/content'
</script>

<template>
  <section class="clients" aria-labelledby="clients-title">
    <div class="clients__head">
      <h2 id="clients-title">Plus de 200 organisations s’y retrouvent déjà</h2>
      <p>97 % de satisfaction, de la RATP au CHU de Lille.</p>
    </div>
    <ul class="clients__logos">
      <li v-for="c in clients" :key="c.file">
        <img :src="`/brand/clients/${c.file}.svg`" :alt="c.name" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.clients {
  display: grid;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: start;
  padding-block: var(--space-6) var(--space-8);
}

.clients__head h2 {
  font-size: var(--fs-xl);
  line-height: 1.15;
}

.clients__head p {
  margin-top: var(--space-3);
  color: var(--on-navy-soft);
  font-size: var(--fs-s);
}

.clients__logos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
  gap: var(--space-5) var(--space-6);
  align-items: center;
}

.clients__logos li {
  display: grid;
  place-items: center;
  height: 3.25rem;
}

.clients__logos img {
  max-height: 100%;
  max-width: 100%;
  width: auto;
  opacity: 0.86;
  transition: opacity 0.2s var(--ease-out);
}

.clients__logos li:hover img {
  opacity: 1;
}

@media (max-width: 900px) {
  .clients {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .clients__logos {
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
    gap: var(--space-4);
  }
}
</style>
