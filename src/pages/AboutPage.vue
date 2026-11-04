<script setup lang="ts">
import { ref } from 'vue'
import PageHero from '../components/ui/PageHero.vue'
import { ambition, identity, phases, timeline, values } from '../data/company'

const rail = ref<HTMLElement | null>(null)

function scrollRail(dir: 1 | -1) {
  const el = rail.value
  if (!el) return
  const step = (el.querySelector('li')?.getBoundingClientRect().width ?? 280) * 2
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <PageHero>
      <template #title>AB+ Software, l’éditeur de myCarto</template>
      <template #lede>
        <span class="ambition">« {{ ambition }} »</span>
      </template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
        <RouterLink class="btn btn--ghost btn--lg" to="/recrutement">Nous rejoindre</RouterLink>
      </template>
      <template #aside>
        <dl class="identity">
          <div v-for="i in identity" :key="i.name">
            <dt>
              <span class="identity__figure">{{ i.figure }}</span>
              <span class="identity__name">{{ i.name }}</span>
            </dt>
            <dd>{{ i.line }}</dd>
          </div>
        </dl>
      </template>
    </PageHero>

    <section class="section double on-navy" aria-labelledby="double-title">
      <div class="wrap">
        <div class="double__head">
          <img src="/brand/company/abplus-white.svg" alt="AB+ Software" width="60" height="49" />
          <h2 id="double-title">Éditeur et intégrateur</h2>
          <p>La même équipe conçoit l’outil et le déploie chez vous.</p>
        </div>
        <ol class="stops">
          <li v-for="p in phases" :key="p.id">
            <span class="stops__dot"><img :src="`/brand/steps/${p.id}.svg`" alt="" width="96" height="96" /></span>
            <h3>{{ p.name }}</h3>
            <p>{{ p.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="values-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="values-title">Nos valeurs</h2>
          <p>Le socle de la fidélité de nos clients.</p>
        </div>
        <ul class="values">
          <li v-for="v in values" :key="v.name">
            <img :src="`/brand/method/${v.icon}.svg`" alt="" width="72" height="72" />
            {{ v.name }}
          </li>
        </ul>
      </div>
    </section>

    <section class="section story" aria-labelledby="story-title">
      <div class="wrap">
        <div class="story__head">
          <div>
            <h2 id="story-title">De Solu-QIQ à myCarto</h2>
            <p>Vingt ans de cartographie du SI, à Montpellier.</p>
          </div>
          <div class="story__nav">
            <button type="button" aria-label="Années précédentes" @click="scrollRail(-1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" aria-label="Années suivantes" @click="scrollRail(1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
        <ol ref="rail" class="rail" tabindex="0" aria-label="Les dates clés, de 2006 à 2026">
          <li v-for="t in timeline" :key="t.year">
            <span class="rail__year">{{ t.year }}</span>
            <p>{{ t.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section ground-cool join" aria-labelledby="join-title">
      <div class="wrap join__inner">
        <div>
          <h2 id="join-title">Une équipe à taille humaine</h2>
          <p>Ingénieurs, consultants, support et commerciaux, au même endroit.</p>
        </div>
        <RouterLink class="btn btn--ghost btn--lg" to="/recrutement">Voir le recrutement</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ambition {
  display: block;
  font-family: var(--font-display);
  color: var(--navy);
}

/* Identity card: four figures in the framed key list. */
.identity {
  margin: 0;
  padding: var(--space-2) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.identity div {
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: var(--space-5);
  align-items: center;
  padding-block: var(--space-4);
}

.identity div + div {
  border-top: 1px solid var(--line);
}

.identity dt {
  display: grid;
  color: var(--navy);
}

.identity__figure {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-2xl);
  line-height: 1;
  letter-spacing: -0.02em;
}

.identity__name {
  margin-top: var(--space-1);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
}

.identity dd {
  margin: 0;
  font-size: var(--fs-s);
}

/* Éditeur et intégrateur: the route line, white on navy. */
.double {
  background: var(--navy);
}

.double__head {
  display: grid;
  justify-items: center;
  max-width: 38rem;
  margin: 0 auto var(--space-7);
  text-align: center;
}

.double__head img {
  width: 3.75rem;
  height: auto;
  margin-bottom: var(--space-4);
}

.double__head h2 {
  font-size: var(--fs-2xl);
}

.double__head p {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  color: var(--on-navy-soft);
}

.stops {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
}

.stops::before {
  content: '';
  position: absolute;
  top: 3.5rem;
  left: 16.7%;
  right: 16.7%;
  height: 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--yellow);
}

.stops li {
  position: relative;
  display: grid;
  justify-items: center;
  text-align: center;
}

.stops__dot {
  display: grid;
  place-items: center;
  width: 7.5rem;
  height: 7.5rem;
  margin-bottom: var(--space-4);
  border: 0.45rem solid var(--yellow);
  border-radius: 50%;
  background: var(--paper);
}

.stops__dot img {
  width: 4.5rem;
  height: 4.5rem;
}

.stops h3 {
  font-size: var(--fs-xl);
}

.stops p {
  margin-top: var(--space-2);
  max-width: 24ch;
  color: var(--on-navy-soft);
}

/* Values: four framed tiles, the folded-map icon beside the word. */
.values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.values li {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.1;
  color: var(--navy);
}

.values img {
  width: 4.5rem;
  height: 4.5rem;
}

/* Story: the years on a navy rail across the yellow ground. */
.story {
  background: var(--yellow);
  color: var(--navy);
}

.story__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-5);
  margin-bottom: var(--space-7);
}

.story__head h2 {
  font-size: var(--fs-2xl);
}

.story__head p {
  margin-top: var(--space-3);
  font-size: var(--fs-l);
}

.story__nav {
  display: flex;
  gap: var(--space-2);
}

.story__nav button {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border: 2px solid var(--navy);
  border-radius: 50%;
  background: transparent;
  color: var(--navy);
  transition:
    background-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.story__nav button:hover {
  background: var(--navy);
  color: var(--on-navy);
}

.story__nav svg {
  width: 1.3rem;
  height: 1.3rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(15rem, 1fr);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: var(--space-2);
}

.rail::-webkit-scrollbar {
  display: none;
}

.rail:focus-visible {
  outline-offset: 6px;
}

.rail li {
  position: relative;
  scroll-snap-align: start;
  padding: 3rem var(--space-6) 0 0;
}

/* The rail runs through every year; each year sits on a stop. */
.rail li::before {
  content: '';
  position: absolute;
  top: 0.85rem;
  left: 0;
  right: 0;
  height: 0.5rem;
  background: var(--navy);
}

.rail li:first-child::before {
  border-radius: var(--radius-pill) 0 0 var(--radius-pill);
}

.rail li:last-child::before {
  right: auto;
  width: 2.2rem;
  border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
}

.rail li::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2.2rem;
  height: 2.2rem;
  border: 0.45rem solid var(--navy);
  border-radius: 50%;
  background: var(--paper);
}

.rail__year {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-2xl);
  line-height: 1;
}

.rail p {
  margin-top: var(--space-3);
  max-width: 24ch;
  font-size: var(--fs-s);
}

.join__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
}

.join h2 {
  font-size: var(--fs-2xl);
}

.join p {
  margin-top: var(--space-3);
  font-size: var(--fs-l);
}

.join .btn--ghost {
  color: var(--navy);
}

.join .btn--ghost:hover {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--on-navy);
}

@media (max-width: 760px) {
  .stops {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .stops::before {
    top: 3.5rem;
    bottom: 3.5rem;
    left: 50%;
    right: auto;
    width: 0.5rem;
    height: auto;
    transform: translateX(-50%);
  }

  .stops li {
    background: var(--navy);
  }

  .identity {
    padding: var(--space-1) var(--space-4);
  }

  .identity div {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  /* The years stack on phones, the rail turns vertical. */
  .story__nav {
    display: none;
  }

  .rail {
    grid-auto-flow: row;
    grid-auto-columns: auto;
    overflow: visible;
    gap: var(--space-5);
  }

  .rail li {
    padding: 0 0 0 3.5rem;
  }

  .rail li::before,
  .rail li:first-child::before,
  .rail li:last-child::before {
    top: 0;
    bottom: calc(-1 * var(--space-5));
    left: 0.85rem;
    right: auto;
    width: 0.5rem;
    height: auto;
    border-radius: 0;
  }

  .rail li:last-child::before {
    display: none;
  }
}

@media (max-width: 520px) {
  .values {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .values li {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    font-size: var(--fs-l);
  }

  .values img {
    width: 3.25rem;
    height: 3.25rem;
  }
}
</style>
