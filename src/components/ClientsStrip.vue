<script setup lang="ts">
import { clients } from '../data/content'

const shown = clients.filter((c) => c.file !== 'bouygues-construction').slice(0, 12)
</script>

<template>
  <section class="section clients" aria-labelledby="clients-title">
    <div class="wrap split">
      <div class="section-head">
        <h2 id="clients-title">Plus de 200 organisations s’y retrouvent</h2>
        <p>97 % de satisfaction.</p>
      </div>
      <ul class="frame clients__logos">
        <li v-for="c in shown" :key="c.file">
          <span
            class="logo"
            role="img"
            :aria-label="c.name"
            :style="{ '--logo': `url(/brand/clients/${c.file}.svg)` }"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.clients {
  padding-top: var(--space-2);
}

.clients__logos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0;
  overflow: hidden;
}

.clients__logos li {
  display: grid;
  place-items: center;
  height: 6.5rem;
  padding: var(--space-4) var(--space-5);
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.clients__logos li:nth-child(4n) {
  border-right: 0;
}

.clients__logos li:nth-last-child(-n + 4) {
  border-bottom: 0;
}

/* Their logos are white monochrome files: recolour them in navy. */
.logo {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--navy);
  mask: var(--logo) center / contain no-repeat;
}

@media (max-width: 720px) {
  .clients__logos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .clients__logos li {
    height: 5rem;
    padding: var(--space-3);
  }

  .clients__logos li:nth-child(4n) {
    border-right: 1px solid var(--line);
  }

  .clients__logos li:nth-child(3n) {
    border-right: 0;
  }

  .clients__logos li:nth-last-child(-n + 4) {
    border-bottom: 1px solid var(--line);
  }

  .clients__logos li:nth-last-child(-n + 3) {
    border-bottom: 0;
  }
}
</style>
