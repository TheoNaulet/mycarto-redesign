<script setup lang="ts">
import { hosting, route } from '../data/content'
</script>

<template>
  <section id="accompagnement" class="section route-section" aria-labelledby="route-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="route-title">Avec vous du choix à l’usage</h2>
        <p>Plus de 200 projets d’implémentation.</p>
      </div>

      <ol class="route">
        <li v-for="stop in route" :key="stop.id" class="stop">
          <span class="stop__mark" aria-hidden="true" />
          <h3>{{ stop.name }}</h3>
          <p>{{ stop.line }}</p>
        </li>
      </ol>

      <dl class="hosting">
        <div v-for="h in hosting" :key="h.name" class="plate">
          <dt>{{ h.name }}</dt>
          <dd>{{ h.line }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.route-section {
  background: var(--yellow);
}

.route-section .section-head p {
  color: var(--navy);
}

.route {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  position: relative;
  padding-top: 3.25rem;
}

.route::before {
  content: '';
  position: absolute;
  top: 1.05rem;
  left: 0.9rem;
  right: 0;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: var(--navy);
}

.stop {
  position: relative;
  color: var(--navy);
}

.stop__mark {
  position: absolute;
  top: -3.25rem;
  left: 0;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--paper);
  border: 0.45rem solid var(--navy);
}

.stop h3 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-2);
}

.stop p {
  max-width: 30ch;
  font-size: var(--fs-s);
}

.hosting {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin: var(--space-8) 0 0;
}

.plate {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--navy);
  color: var(--on-navy);
}

.plate dt {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  white-space: nowrap;
}

.plate dd {
  margin: 0;
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

@media (max-width: 860px) {
  .route {
    grid-template-columns: 1fr;
    padding-top: 0;
    padding-left: 3.5rem;
  }

  .route::before {
    top: 0.9rem;
    bottom: 0.9rem;
    left: 0.95rem;
    right: auto;
    width: 0.5rem;
    height: auto;
  }

  .stop__mark {
    top: 0;
    left: -3.5rem;
  }

  .hosting {
    grid-template-columns: 1fr;
  }

  .plate {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>
