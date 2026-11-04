<script setup lang="ts">
// Nos clients: the logo wall, the ten case studies (each links to /clients/:slug), testimonials and club.
import { clients } from '../data/content'
import { caseStudies } from '../data/cases'
import VoicesBoard from '../components/VoicesBoard.vue'
import ClubSection from '../components/ClubSection.vue'
</script>

<template>
  <div>
    <section class="wall on-navy" aria-labelledby="clients-title">
      <div class="wrap">
        <h1 id="clients-title">Plus de 200 organisations nous font confiance</h1>
        <p>Collectivités, santé, industrie, universités, ministères. 97 % de satisfaction.</p>
        <ul class="wall__logos">
          <li v-for="c in clients" :key="c.file">
            <img :src="`/brand/clients/${c.file}.svg`" :alt="c.name" />
          </li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="cases-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="cases-title">Leurs projets</h2>
          <p>Dix cas clients, du CHU au ministère.</p>
        </div>
        <ul class="cases">
          <li v-for="c in caseStudies" :key="c.slug">
            <RouterLink class="case" :to="`/clients/${c.slug}`">
              <span class="case__logo">
                <img :src="c.logo" alt="" />
              </span>
              <span class="case__body">
                <span class="case__org">{{ c.org }}</span>
                <span class="case__figure">{{ c.card.figure }}</span>
                <span class="case__line">{{ c.card.line }}</span>
              </span>
              <span class="case__go">Lire le cas client</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <VoicesBoard />
    <ClubSection />
  </div>
</template>

<style scoped>
.wall {
  background: var(--navy);
  padding-block: var(--space-8);
}

.wall h1 {
  font-size: var(--fs-3xl);
  line-height: 1.02;
  letter-spacing: -0.02em;
  max-width: 16ch;
}

.wall p {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  color: var(--on-navy-soft);
}

.wall__logos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.wall__logos li {
  display: grid;
  place-items: center;
  height: 3.5rem;
}

.wall__logos img {
  max-height: 100%;
  max-width: 100%;
  width: auto;
}

.cases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.case {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  grid-template-areas:
    'logo body'
    'logo go';
  gap: var(--space-2) var(--space-5);
  height: 100%;
  padding: var(--space-5);
  border: 2px solid var(--line);
  border-radius: var(--radius-panel);
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.2s var(--ease-out);
}

.case:hover {
  border-color: var(--navy);
}

.case__logo {
  grid-area: logo;
  display: grid;
  place-items: center;
  width: 6.5rem;
  height: 6.5rem;
  border-radius: var(--radius-plate);
  background: var(--paper-cool);
  overflow: hidden;
}

.case__logo img {
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
}

.case__body {
  grid-area: body;
  display: grid;
  gap: 0.15rem;
}

.case__org {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--navy);
}

.case__figure {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  color: var(--navy);
  line-height: 1.15;
}

.case__line {
  font-size: var(--fs-s);
  line-height: 1.5;
}

.case__go {
  grid-area: go;
  align-self: end;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  color: var(--navy);
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.3em;
}

@media (max-width: 900px) {
  .cases {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .case {
    grid-template-columns: 4.5rem minmax(0, 1fr);
    padding: var(--space-4);
  }

  .case__logo {
    width: 4.5rem;
    height: 4.5rem;
  }
}
</style>
