<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import KeyList from '../components/ui/KeyList.vue'
import { practices, projectSteps, services, smart } from '../data/product'
import { vDraw } from '../motion/draw'

const serviceKeys = services.map((s) => ({ name: s.name, line: s.line, icon: `/brand/integration/${s.icon}.svg` }))
</script>

<template>
  <div>
    <PageHero title-id="integration-title">
      <template #title>Opérationnel en moins d’un mois</template>
      <template #lede>Plus de 200 implémentations nous ont donné une méthode simple, qui part de vos données.</template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
        <RouterLink class="btn btn--ghost btn--lg" to="/contact">Contact commercial</RouterLink>
      </template>
      <template #aside>
        <div class="services">
          <h2 class="services__title">Nos quatre prestations</h2>
          <KeyList :items="serviceKeys" icon-size="l" />
        </div>
      </template>
    </PageHero>

    <!-- SMART: cool grey, the five letters spelled out as tiles -->
    <section class="section smart-section" aria-labelledby="smart-title">
      <div class="wrap">
        <div class="section-head smart__head">
          <h2 id="smart-title">La méthode SMART</h2>
          <p>Le pilier de chaque projet myCarto.</p>
        </div>
        <ol class="smart">
          <li v-for="s in smart" :key="s.letter">
            <span class="smart__letter" aria-hidden="true">{{ s.letter }}</span>
            <h3>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Steps: navy, a vertical stepper -->
    <section class="section steps-section on-navy" aria-labelledby="steps-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="steps-title">Six étapes, du lancement à la clôture</h2>
          <p>Des cycles courts, et des résultats concrets à chaque comité de pilotage.</p>
        </div>
        <ol v-draw class="stepper">
          <li v-for="(s, i) in projectSteps" :key="s.name" :style="{ '--i': i }">
            <span class="stepper__num" aria-hidden="true">{{ i + 1 }}</span>
            <div>
              <h3>{{ s.name }}</h3>
              <p>{{ s.line }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Practices: yellow, four rules in columns -->
    <section class="section practices-section" aria-labelledby="practices-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="practices-title">Ce qui fait réussir un projet</h2>
          <p>Quatre règles, appliquées à chacun.</p>
        </div>
        <ul class="practices">
          <li v-for="p in practices" :key="p.name">
            <h3>{{ p.name }}</h3>
            <p>{{ p.line }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero aside */
.services__title {
  margin-bottom: var(--space-4);
  font-size: var(--fs-xl);
}

/* SMART */
.smart-section {
  background: var(--paper-cool);
}

.smart__head {
  margin-inline: auto;
  text-align: center;
}

.smart__head p {
  margin-inline: auto;
}

.smart {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-4);
}

.smart li {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.smart__letter {
  display: grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: var(--space-3);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--navy);
  /* Nexa sits a little high in its box. */
  padding-top: 0.2rem;
}

.smart h3 {
  font-size: var(--fs-xl);
}

.smart p {
  font-size: var(--fs-s);
  line-height: 1.5;
}

/* Steps */
.steps-section {
  background: var(--navy);
}

.steps-section .section-head p {
  color: var(--on-navy-soft);
}

.stepper {
  display: grid;
}

.stepper li {
  position: relative;
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-5);
  padding-bottom: var(--space-6);
}

.stepper li:last-child {
  padding-bottom: 0;
}

/* The rail between two discs. */
.stepper li:not(:last-child)::before {
  content: '';
  position: absolute;
  left: calc(1.5rem - 1.5px);
  top: 3rem;
  bottom: 0;
  width: 3px;
  background: var(--on-navy-line);
  transform-origin: top;
  transition: transform 0.35s var(--ease-draw) calc(0.25s + var(--i) * 160ms);
}

/* Once in view, the rail runs down from disc to disc. */
.stepper__num {
  transition: scale 0.35s var(--ease-out) calc(0.1s + var(--i) * 160ms);
}

.stepper[data-draw]:not(.is-drawn) li::before {
  transform: scaleY(0);
}

.stepper[data-draw]:not(.is-drawn) .stepper__num {
  scale: 0.5;
}

.stepper__num {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  padding-top: 0.15rem;
  border-radius: 50%;
  background: var(--yellow);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  color: var(--navy);
}

.stepper h3 {
  padding-top: 0.55rem;
  font-size: var(--fs-xl);
}

.stepper p {
  margin-top: var(--space-1);
  max-width: 52ch;
  color: var(--on-navy-soft);
}

/* Practices */
.practices-section {
  background: var(--yellow);
}

.practices-section .section-head p {
  color: var(--navy);
}

.practices {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-6);
}

.practices li {
  padding-top: var(--space-5);
  border-top: var(--frame) solid var(--navy);
}

.practices h3 {
  font-size: var(--fs-xl);
}

.practices p {
  margin-top: var(--space-2);
  color: var(--navy);
}

@media (max-width: 1100px) {
  .smart {
    grid-template-columns: 1fr;
    max-width: 40rem;
    margin-inline: auto;
  }

  .smart li {
    grid-template-columns: 4rem minmax(0, 1fr);
    column-gap: var(--space-4);
    padding: var(--space-4);
  }

  .smart__letter {
    grid-row: span 2;
    width: 4rem;
    height: 4rem;
    margin: 0;
    font-size: 2.5rem;
  }

  .practices {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .practices {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}
</style>
