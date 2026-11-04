<script setup lang="ts">
import { route } from '../data/content'
</script>

<template>
  <section id="accompagnement" class="section route-section" aria-labelledby="route-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="route-title">Avec vous sur tout le trajet</h2>
        <p>Plus de 200 projets d’implémentation, et un accompagnement du choix à l’usage.</p>
      </div>

      <ol class="route">
        <li v-for="(stop, i) in route" :key="stop.id" class="stop" :class="{ 'is-last': i === route.length - 1 }">
          <span class="stop__mark" aria-hidden="true" />
          <h3>{{ stop.name }}</h3>
          <p>{{ stop.line }}</p>
        </li>
      </ol>

      <div class="hosting">
        <h3 class="hosting__title">Chez vous ou chez nous</h3>
        <dl class="hosting__options">
          <div class="plate">
            <dt>SaaS</dt>
            <dd>Hébergé en Europe, conforme RGPD, sur abonnement.</dd>
          </div>
          <div class="plate">
            <dt>On Premise</dt>
            <dd>Installé sur votre infrastructure, en investissement.</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.route {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  position: relative;
  padding-top: 3.25rem;
}

/* The line the stops sit on */
.route::before {
  content: '';
  position: absolute;
  top: 1.05rem;
  left: 0.9rem;
  right: 0;
  height: 0.6rem;
  border-radius: 0.3rem;
  background: var(--navy);
}

.stop {
  position: relative;
}

.stop__mark {
  position: absolute;
  top: -3.25rem;
  left: 0;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--paper);
  border: 0.5rem solid var(--navy);
}

.stop.is-last .stop__mark {
  background: var(--navy);
}

.stop h3 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-2);
}

.stop p {
  max-width: 32ch;
  font-size: var(--fs-s);
  line-height: 1.55;
}

.hosting {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1.6fr);
  gap: var(--space-6);
  align-items: center;
  margin-top: var(--space-9);
  padding-top: var(--space-7);
  border-top: 1px solid var(--line);
}

.hosting__title {
  font-size: var(--fs-xl);
}

.hosting__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin: 0;
}

.plate {
  padding: var(--space-5);
  border: 2px solid var(--navy);
  border-radius: var(--radius-plate);
}

.plate dt {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  color: var(--navy);
}

.plate dd {
  margin: var(--space-1) 0 0;
  font-size: var(--fs-s);
}

@media (max-width: 860px) {
  .route {
    grid-template-columns: 1fr;
    padding-top: 0;
    padding-left: 3.5rem;
    gap: var(--space-6);
  }

  .route::before {
    top: 0.9rem;
    bottom: 0.9rem;
    left: 0.9rem;
    right: auto;
    width: 0.6rem;
    height: auto;
  }

  .stop__mark {
    top: 0;
    left: -3.5rem;
  }

  .hosting {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

@media (max-width: 560px) {
  .hosting__options {
    grid-template-columns: 1fr;
  }
}
</style>
