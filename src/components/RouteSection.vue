<script setup lang="ts">
import { hosting, route } from '../data/content'
</script>

<template>
  <section id="accompagnement" class="section route-section" aria-labelledby="route-title">
    <div class="wrap">
      <div class="section-head route__head">
        <h2 id="route-title">Avec vous du choix à l’usage</h2>
        <p>Plus de 200 projets d’implémentation.</p>
      </div>

      <ol class="steps">
        <li v-for="stop in route" :key="stop.id" class="step">
          <img :src="`/brand/steps/${stop.id}.svg`" alt="" width="96" height="96" />
          <h3>{{ stop.name }}</h3>
          <p>{{ stop.line }}</p>
        </li>
      </ol>

      <ul class="hosting" aria-label="Modes d’hébergement">
        <li v-for="h in hosting" :key="h.name">
          <strong>{{ h.name }}</strong>
          {{ h.line }}
        </li>
      </ul>
      <p class="route__more">
        <RouterLink class="link-more" to="/integration">Notre méthode de déploiement</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.route-section {
  background: var(--yellow);
}

.route__head {
  margin-inline: auto;
  text-align: center;
}

.route__head p {
  color: var(--navy);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-7);
}

.step {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  padding: var(--space-6) var(--space-5) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
  text-align: center;
}

/* A navy arrow joins each tile to the next. */
.step + .step::before {
  content: '';
  position: absolute;
  left: calc(-1 * var(--space-7));
  top: 50%;
  width: var(--space-7);
  height: 1.5rem;
  transform: translateY(-50%);
  background: var(--navy);
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24"><path d="M6 12h34M31 4l9 8-9 8" fill="none" stroke="black" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    center / contain no-repeat;
}

.step img {
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: var(--space-4);
}

.step h3 {
  font-size: var(--fs-xl);
}

.step p {
  margin-top: var(--space-2);
  max-width: 26ch;
  font-size: var(--fs-s);
}

.hosting {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-7);
}

.hosting li {
  padding: 0.65rem 1.25rem 0.55rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy-soft);
  font-size: var(--fs-s);
}

.hosting strong {
  font-family: var(--font-display);
  color: var(--on-navy);
  margin-right: 0.35em;
}

.route__more {
  margin-top: var(--space-6);
  text-align: center;
}

/* On the yellow ground the link underline turns navy. */
.route__more .link-more {
  color: var(--navy);
  text-decoration-color: var(--navy);
}

.route__more .link-more:hover {
  text-decoration-thickness: 1px;
}

@media (max-width: 860px) {
  .steps {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    max-width: 26rem;
    margin-inline: auto;
  }

  .step + .step::before {
    left: 50%;
    top: calc(-1 * var(--space-6));
    width: var(--space-6);
    height: 1.25rem;
    transform: translate(-50%, 0) rotate(90deg);
  }
}
</style>
