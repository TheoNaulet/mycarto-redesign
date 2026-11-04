<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import { candidate, site } from '../data/content'
import { careersEmail, hiringSteps, reasons } from '../data/company'
import { vDraw } from '../motion/draw'

const spontaneous = `mailto:${careersEmail}?subject=${encodeURIComponent('Candidature spontanée')}`
</script>

<template>
  <div>
    <PageHero>
      <template #title>Nous rejoindre</template>
      <template #lede>AB+ Software grandit grâce à la fidélité de ses clients, et cherche toujours de nouveaux talents.</template>
      <template #actions>
        <a class="btn btn--primary btn--lg" :href="spontaneous">Envoyer ma candidature</a>
        <a class="btn btn--ghost btn--lg" :href="site.linkedin" rel="noopener">Nous suivre</a>
      </template>
      <template #aside>
        <div class="jobs">
          <h2>Postes à pourvoir</h2>
          <ul>
            <li class="job job--here">
              <span class="job__name">Développeur front UI/UX</span>
              <span class="job__where">Montpellier</span>
              <span class="job__here">Vous êtes ici</span>
              <span class="job__line">Cette maquette est la candidature de {{ candidate.name }} à cette offre.</span>
            </li>
            <li>
              <a class="job" :href="spontaneous">
                <span class="job__name">Candidature spontanée</span>
                <span class="job__where">Tous métiers</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <span class="job__line">Pas d’offre pour vous sur notre job board&nbsp;? Tentez votre chance.</span>
              </a>
            </li>
          </ul>
        </div>
      </template>
    </PageHero>

    <section class="section why on-navy" aria-labelledby="why-title">
      <div class="wrap">
        <div class="section-head why__head">
          <h2 id="why-title">Pourquoi travailler avec nous</h2>
          <p>L’ADN d’une start-up, dans une entreprise à taille humaine.</p>
        </div>
        <ul class="why__list">
          <li v-for="r in reasons" :key="r.name">
            <h3>{{ r.name }}</h3>
            <p>{{ r.line }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="process-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="process-title">Le recrutement, en six étapes</h2>
          <p>Une lettre qui vous ressemble compte plus qu’un publipostage.</p>
        </div>
        <ol v-draw class="process">
          <li v-for="(s, i) in hiringSteps" :key="s.name" :style="{ '--i': i }">
            <span class="process__num" aria-hidden="true">{{ i + 1 }}</span>
            <h3>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Open positions: a framed list, the first row marked as the page you are on. */
.jobs {
  padding: var(--space-5) var(--space-6) var(--space-2);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.jobs h2 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-2);
}

.jobs li + li {
  border-top: 1px solid var(--line);
}

.job {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'name tag'
    'where tag'
    'line line';
  column-gap: var(--space-4);
  padding-block: var(--space-4);
  color: var(--navy);
  text-decoration: none;
}

.job__name {
  grid-area: name;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
}

.job__where {
  grid-area: where;
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--text-muted);
}

.job__line {
  grid-area: line;
  margin-top: var(--space-2);
  font-size: var(--fs-s);
  color: var(--text);
}

.job__here {
  grid-area: tag;
  align-self: center;
  padding: 0.45rem 0.9rem 0.4rem;
  border-radius: var(--radius-pill);
  background: var(--yellow);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1;
  white-space: nowrap;
}

.job svg {
  grid-area: tag;
  align-self: center;
  width: 1.4rem;
  height: 1.4rem;
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

a.job:hover .job__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

a.job:hover svg {
  transform: translateX(3px);
}

.why {
  background: var(--navy);
}

.why__head p {
  color: var(--on-navy-soft);
}

.why__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-6);
}

.why__list li {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding-top: var(--space-5);
  border-top: 0.5rem solid var(--yellow);
}

.why__list h3 {
  font-size: var(--fs-xl);
}

.why__list p {
  color: var(--on-navy-soft);
}

/* Six numbered stops, joined by a navy rail. */
.process {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-5);
}

.process li {
  position: relative;
  display: grid;
  align-content: start;
  gap: var(--space-2);
}

/* The rail runs from each number to the next one. */
.process li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1.45rem;
  left: calc(3.25rem + 0.5rem);
  right: calc(0.5rem - var(--space-5));
  height: 0.35rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  transform-origin: left;
  transition: transform 0.3s var(--ease-draw) calc(0.3s + var(--i) * 180ms);
}

/* Step by step: each number lands, then the rail runs to the next one. */
.process__num {
  transition: scale 0.35s var(--ease-out) calc(0.15s + var(--i) * 180ms);
}

.process[data-draw]:not(.is-drawn) li::after {
  transform: scaleX(0);
}

.process[data-draw]:not(.is-drawn) .process__num {
  scale: 0.4;
}

.process__num {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: var(--space-2);
  border-radius: 50%;
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

.process li:first-child .process__num {
  background: var(--yellow);
  color: var(--navy);
}

.process h3 {
  font-size: var(--fs-l);
}

.process p {
  font-size: var(--fs-s);
}

@media (max-width: 1100px) {
  .why__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .process {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: var(--space-7);
  }

  .process li:nth-child(3n)::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .jobs {
    padding: var(--space-4) var(--space-4) var(--space-1);
  }

  .why__list {
    grid-template-columns: 1fr;
  }

  .process {
    grid-template-columns: 1fr;
    row-gap: var(--space-5);
  }

  .process li {
    grid-template-columns: 3.25rem minmax(0, 1fr);
    column-gap: var(--space-4);
  }

  .process__num {
    grid-row: span 2;
    margin-bottom: 0;
  }

  .process li:not(:last-child)::after,
  .process li:nth-child(3n)::after {
    display: block;
    top: calc(3.25rem + 0.4rem);
    bottom: calc(0.4rem - var(--space-5));
    left: calc(1.625rem - 0.175rem);
    right: auto;
    width: 0.35rem;
    height: auto;
    transform-origin: top;
  }

  .process[data-draw]:not(.is-drawn) li::after {
    transform: scaleY(0);
  }
}
</style>
