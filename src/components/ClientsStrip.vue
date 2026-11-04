<script setup lang="ts">
import { clients } from '../data/content'

const shown = clients.slice(0, 14)
</script>

<template>
  <section class="clients on-navy" aria-labelledby="clients-title">
    <div class="wrap">
      <h2 id="clients-title">Plus de 200 organisations s’y retrouvent, <span>97 % satisfaites.</span></h2>
      <ul class="clients__logos">
        <li v-for="c in shown" :key="c.file">
          <img :src="`/brand/clients/${c.file}.svg`" :alt="c.name" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.clients {
  display: flex;
  align-items: center;
  min-height: 100dvh;
  background: var(--navy);
  padding-block: var(--space-9);
}

.clients > .wrap {
  width: min(100% - 2 * var(--gutter), var(--max));
}

.clients h2 {
  font-size: var(--fs-2xl);
  line-height: 1.1;
  max-width: 22ch;
}

.clients h2 span {
  display: block;
}

.clients h2 span {
  color: var(--yellow);
}

.clients__logos {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-7) var(--space-6);
  margin-top: var(--space-8);
}

.clients__logos li {
  display: grid;
  place-items: center;
  height: 4.5rem;
}

.clients__logos img {
  max-height: 100%;
  max-width: 100%;
  width: auto;
}

@media (max-width: 900px) {
  .clients__logos {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .clients {
    padding-block: var(--space-8);
  }

  .clients__logos li {
    height: 3.5rem;
  }

  .clients__logos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-4);
  }
}
</style>
