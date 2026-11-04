<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { soluQiqChanges, soluQiqStory } from '../data/product'
import { voices } from '../data/content'

const quote = voices.find((v) => v.id === 'delysse')!
</script>

<template>
  <div>
    <PageHero title-id="soluqiq-title">
      <template #title>Solu-QIQ devient myCarto</template>
      <template #lede>Plus de quatre ans de R&amp;D : toutes les fonctions qui ont fait son succès, sur une technologie entièrement neuve.</template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Voir la nouvelle version</RouterLink>
      </template>
      <template #aside>
        <figure class="rename" aria-label="Solu-QIQ, de 2006 à 2023, devient myCarto en 2023">
          <div class="rename__plate rename__plate--old">
            <img src="/brand/product/logo-solu-qiq.svg" alt="" width="240" height="70" />
            <span>2006 – 2023</span>
          </div>
          <svg class="rename__arrow" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M8 24h30M28 13l11 11-11 11" />
          </svg>
          <div class="rename__plate rename__plate--new">
            <span class="rename__logo"><BrandLogo /></span>
            <span>Depuis 2023</span>
          </div>
        </figure>
      </template>
    </PageHero>

    <!-- The story: navy timeline -->
    <section class="section story on-navy" aria-labelledby="story-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="story-title">Vingt ans pour changer d’échelle</h2>
          <p>D’un outil de consultant à la plateforme de plus de 200 DSI.</p>
        </div>
        <ol class="story__line">
          <li v-for="s in soluQiqStory" :key="s.year">
            <span class="story__year">{{ s.year }}</span>
            <p>{{ s.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Six changes: one framed grid -->
    <section class="section" aria-labelledby="changes-title">
      <div class="wrap">
        <div class="section-head changes__head">
          <h2 id="changes-title">Ce qui change</h2>
          <p>Six évolutions majeures, et rien de perdu en route.</p>
        </div>
        <ol class="changes">
          <li v-for="(c, i) in soluQiqChanges" :key="c.name">
            <span class="changes__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ c.name }}</h3>
            <p>{{ c.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Migration: yellow, for existing Solu-QIQ clients -->
    <section class="section migrate" aria-labelledby="migrate-title">
      <div class="wrap migrate__grid">
        <div>
          <h2 id="migrate-title">Déjà sur Solu-QIQ ?</h2>
          <p class="migrate__lede">Depuis 2024, nos équipes accompagnent les clients historiques vers myCarto.</p>
          <RouterLink class="btn btn--ghost btn--lg migrate__cta" to="/contact">Parler de votre migration</RouterLink>
        </div>
        <figure class="migrate__quote">
          <blockquote>
            <p>« {{ quote.quote }} »</p>
          </blockquote>
          <figcaption>{{ quote.name }}, {{ quote.role }}, {{ quote.org }}</figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero visual: the old name, an arrow, the new one, on the yellow ground of the home hero frame */
.rename {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-8) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
}

.rename__plate {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: var(--space-4);
  padding: var(--space-7) var(--space-5) var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--paper);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  color: var(--navy);
}

.rename__plate--old {
  background: var(--paper-cool);
  color: var(--text-muted);
}

.rename__plate--old img {
  width: 100%;
  max-width: 13rem;
  height: auto;
}

.rename__plate--new {
  border: var(--frame) solid var(--navy);
}

.rename__logo {
  display: block;
  height: 4.2rem;
}

.rename__arrow {
  align-self: center;
  width: 3.25rem;
  height: 3.25rem;
  padding: 0.6rem;
  border-radius: 50%;
  background: var(--navy);
  fill: none;
  stroke: var(--yellow);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Story */
.story {
  background: var(--navy);
}

.story .section-head p {
  color: var(--on-navy-soft);
}

.story__line {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-6);
}

.story__line li {
  position: relative;
  padding-top: var(--space-6);
  border-top: 3px solid var(--on-navy-line);
}

/* A yellow stop on the line above each year. */
.story__line li::before {
  content: '';
  position: absolute;
  top: calc(-0.75rem - 1.5px);
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: 0.4rem solid var(--yellow);
  border-radius: 50%;
  background: var(--navy);
}

.story__line li:last-child::before {
  background: var(--yellow);
}

.story__year {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-3xl);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--yellow);
}

.story__line p {
  margin-top: var(--space-3);
  max-width: 28ch;
  color: var(--on-navy-soft);
}

/* Changes */
.changes__head {
  margin-inline: auto;
  text-align: center;
}

.changes__head p {
  margin-inline: auto;
}

.changes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
}

.changes li {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-6);
  border-color: var(--line);
  border-style: solid;
  border-width: 0 0 1px 1px;
}

.changes li:nth-child(3n + 1) {
  border-left-width: 0;
}

.changes li:nth-last-child(-n + 3) {
  border-bottom-width: 0;
}

.changes__num {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: var(--space-3);
  padding-top: 0.15rem;
  border-radius: 50%;
  background: var(--yellow);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
}

.changes h3 {
  font-size: var(--fs-xl);
}

.changes p {
  font-size: var(--fs-s);
  line-height: 1.5;
  max-width: 34ch;
}

/* Migration */
.migrate {
  background: var(--yellow);
}

.migrate__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr);
  gap: var(--space-8);
  align-items: center;
}

.migrate h2 {
  font-size: var(--fs-2xl);
}

.migrate__lede {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  line-height: 1.45;
  color: var(--navy);
  max-width: 30ch;
}

.migrate__cta {
  margin-top: var(--space-6);
  color: var(--navy);
}

.migrate__cta:hover {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--on-navy);
}

.migrate__quote {
  margin: 0;
  padding-left: var(--space-7);
  border-left: var(--frame) solid var(--navy);
}

.migrate__quote p {
  font-family: var(--font-display);
  font-size: var(--fs-2xl);
  line-height: 1.15;
  color: var(--navy);
  max-width: 24ch;
}

.migrate__quote figcaption {
  margin-top: var(--space-4);
  font-weight: 600;
  color: var(--navy);
}

@media (max-width: 1000px) {
  .story__line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: var(--space-7);
  }

  .changes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .changes li,
  .changes li:nth-child(3n + 1),
  .changes li:nth-last-child(-n + 3) {
    border-width: 0 0 1px 1px;
  }

  .changes li:nth-child(2n + 1) {
    border-left-width: 0;
  }

  .changes li:nth-last-child(-n + 2) {
    border-bottom-width: 0;
  }

  .migrate__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

@media (max-width: 640px) {
  .rename {
    grid-template-columns: 1fr;
    justify-items: stretch;
    padding: var(--space-5);
  }

  .rename__arrow {
    justify-self: center;
    transform: rotate(90deg);
  }

  .rename__plate {
    padding: var(--space-5);
  }

  .story__line {
    grid-template-columns: 1fr;
    row-gap: var(--space-6);
  }

  .changes {
    grid-template-columns: 1fr;
  }

  .changes li,
  .changes li:nth-child(2n + 1),
  .changes li:nth-child(3n + 1),
  .changes li:nth-last-child(-n + 2),
  .changes li:nth-last-child(-n + 3) {
    border-width: 0 0 1px;
    padding: var(--space-5);
  }

  .changes li:last-child {
    border-bottom-width: 0;
  }

  .migrate__quote {
    padding-left: var(--space-5);
  }
}
</style>
