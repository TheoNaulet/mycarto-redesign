<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '../components/ui/PageHero.vue'
import KeyList from '../components/ui/KeyList.vue'
import TickList from '../components/ui/TickList.vue'
import CaseCard from '../components/clients/CaseCard.vue'
import { findCase, nextCases } from '../data/cases'
import { setPageTitle, showNotFound } from '../router'
import BaseBadge from '../components/ui/BaseBadge.vue'

const route = useRoute()

const study = computed(() => findCase(String(route.params.slug ?? '')))
const others = computed(() => (study.value ? nextCases(study.value.slug) : []))

watchEffect(() => {
  if (route.name !== 'case') return
  if (!study.value) {
    showNotFound(route.path)
    return
  }
  setPageTitle(`${study.value.org}, cas client`)
})
</script>

<template>
  <div v-if="study" :key="study.slug">
    <PageHero title-id="case-title">
      <template #before>
        <RouterLink class="back" to="/clients">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
          Tous les cas clients
        </RouterLink>
      </template>
      <template #title>{{ study.org }}</template>
      <template #lede>{{ study.title }}</template>

      <ul class="figures" aria-label="Chiffres clés">
        <li v-for="f in study.figures" :key="f.label">
          <strong>{{ f.value }}</strong>
          <span>{{ f.label }}</span>
        </li>
      </ul>
      <p class="meta">
        <BaseBadge>{{ study.sector }}</BaseBadge>
        <a class="meta__source" :href="study.source" rel="noopener">Le cas complet sur my-carto.com</a>
      </p>

      <template #aside>
        <figure v-if="study.cover" class="cover">
          <img :src="study.cover" :alt="study.org" width="1100" height="600" fetchpriority="high" />
        </figure>
        <div v-else class="cover cover--logo">
          <span class="cover__plate">
            <img :src="study.logo" :alt="study.org" />
          </span>
        </div>
      </template>
    </PageHero>

    <!-- Where they started: cool grey, heading beside the framed list of challenges -->
    <section class="section ground-cool" aria-labelledby="t-start">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="t-start">Le point de départ</h2>
          <p>{{ study.context }}</p>
        </div>
        <KeyList :items="study.challenge" />
      </div>
    </section>

    <!-- What they did: numbered tiles, then a real screen when there is one -->
    <section class="section" aria-labelledby="t-how">
      <div class="wrap">
        <div class="section-head how__head">
          <h2 id="t-how">Ce qu’ils ont fait avec myCarto</h2>
        </div>
        <ol class="steps">
          <li v-for="(s, i) in study.approach" :key="s.name">
            <span class="steps__n" aria-hidden="true">{{ i + 1 }}</span>
            <h3>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
        <figure
          v-if="study.screen"
          class="screen"
          :class="{ 'screen--wide': study.screen.wide, 'screen--illustration': study.screen.illustration }"
        >
          <span class="screen__frame">
            <img
              :src="study.screen.src"
              alt=""
              :width="study.screen.width"
              :height="study.screen.height"
              loading="lazy"
            />
          </span>
          <figcaption>{{ study.screen.caption }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- In their words: navy, the big quote in yellow -->
    <section class="voice on-navy" aria-label="Témoignage">
      <div class="wrap voice__grid" :class="{ 'voice__grid--solo': !study.second }">
        <figure class="voice__main">
          <blockquote>
            <p>«&nbsp;{{ study.quote.text }}&nbsp;»</p>
          </blockquote>
          <figcaption>
            <strong>{{ study.quote.name }}</strong>
            {{ study.quote.role }}
          </figcaption>
        </figure>
        <figure v-if="study.second" class="voice__second">
          <blockquote>
            <p>«&nbsp;{{ study.second.text }}&nbsp;»</p>
          </blockquote>
          <figcaption>
            <strong>{{ study.second.name }}</strong>
            {{ study.second.role }}
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- What changed: yellow, ticks beside a navy plate with their tip -->
    <section class="section results" aria-labelledby="t-results">
      <div class="wrap results__grid">
        <div>
          <h2 id="t-results">Ce qui a changé</h2>
          <TickList class="results__ticks" :items="study.results" ground="yellow" />
        </div>
        <aside class="tip" aria-labelledby="t-tip">
          <img src="/brand/nav/arrow-yellow.svg" alt="" width="64" height="24" />
          <h3 id="t-tip">{{ study.tip.title }}</h3>
          <p>{{ study.tip.text }}</p>
        </aside>
      </div>
    </section>

    <!-- Next cases -->
    <section class="section" aria-labelledby="t-more">
      <div class="wrap">
        <div class="more__head">
          <h2 id="t-more">D’autres cas clients</h2>
          <RouterLink class="link-more" to="/clients">Les dix cas clients</RouterLink>
        </div>
        <ul class="more__list">
          <li v-for="o in others" :key="o.slug">
            <CaseCard :study="o" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Head */
.back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-5);
  font-weight: 600;
  font-size: var(--fs-s);
  color: var(--navy);
  text-decoration: none;
}

.back:hover {
  text-decoration: underline;
}

.back svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.figures {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.figures li {
  display: grid;
  align-content: start;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-5);
}

.figures li + li {
  border-left: 1px solid var(--line);
}

.figures strong {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 1rem + 1.6vw, 2.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--navy);
  white-space: nowrap;
}

.figures span {
  font-size: var(--fs-s);
  line-height: 1.35;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-5);
}

.meta__source {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--navy);
}

.cover {
  margin: 0;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  max-height: calc(100dvh - 14rem);
  object-fit: cover;
  /* Their covers carry the client logo on the left: crop from the right. */
  object-position: left center;
  animation: rise 0.9s var(--ease-out) 0.1s both;
}

.cover--logo {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 10;
  background: var(--yellow);
}

.cover__plate {
  display: grid;
  place-items: center;
  width: 62%;
  aspect-ratio: 16 / 9;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.cover--logo img {
  width: 72%;
  height: auto;
  max-height: 70%;
  aspect-ratio: auto;
  object-fit: contain;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

/* Approach */
.how__head {
  max-width: none;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.steps li {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: var(--space-2);
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.steps__n {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  margin-bottom: var(--space-3);
  border-radius: 50%;
  background: var(--yellow);
  color: var(--navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1;
  padding-top: 0.15em;
}

.steps h3 {
  font-size: var(--fs-l);
  line-height: 1.2;
}

.steps p {
  font-size: var(--fs-s);
  line-height: 1.5;
}

.screen {
  margin: var(--space-7) auto 0;
  max-width: 62rem;
}

.screen--wide {
  max-width: none;
}

.screen__frame {
  display: grid;
  place-items: center;
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper-cool);
}

.screen__frame img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 36rem;
  border-radius: var(--radius-plate);
}

.screen--wide .screen__frame img {
  width: 100%;
  max-height: none;
}

.screen--illustration {
  max-width: 40rem;
}

.screen--illustration .screen__frame {
  padding: var(--space-6) var(--space-7);
}

.screen figcaption {
  margin-top: var(--space-3);
  font-size: var(--fs-s);
  color: var(--text-muted);
  text-align: center;
}

/* Voice */
.voice {
  background: var(--navy);
  padding-block: var(--space-9);
}

.voice__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}

.voice__grid--solo {
  grid-template-columns: minmax(0, 1fr);
}

.voice figure {
  margin: 0;
}

.voice__main p {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.05rem + 1.5vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--yellow);
  max-width: 32ch;
}

.voice__second {
  padding-left: var(--space-6);
  border-left: 1px solid var(--on-navy-line);
}

.voice__second p {
  font-family: var(--font-display);
  font-size: var(--fs-l);
  line-height: 1.4;
}

.voice figcaption {
  display: grid;
  gap: 0.15rem;
  margin-top: var(--space-5);
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

.voice figcaption strong {
  font-size: var(--fs-m);
  color: var(--on-navy);
}

/* Results */
.results {
  background: var(--yellow);
}

.results h2 {
  font-size: var(--fs-2xl);
}

.results__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.results__ticks {
  margin-top: var(--space-6);
}

.tip {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding: var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--navy);
  color: var(--on-navy-soft);
}

.tip img {
  width: 4rem;
  height: auto;
}

.tip h3 {
  font-size: var(--fs-xl);
  color: var(--on-navy);
}

.tip p {
  font-size: var(--fs-l);
  line-height: 1.45;
}

/* More */
.more__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.more__head h2 {
  font-size: var(--fs-2xl);
}

.more__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

@media (--bp-l) {
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .voice__grid,
  .results__grid,
  .more__list {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .voice__second {
    padding-left: 0;
    padding-top: var(--space-6);
    border-left: 0;
    border-top: 1px solid var(--on-navy-line);
  }
}

@media (--bp-s) {
  /* The lineage view stays readable: it scrolls sideways in its frame. */
  .screen--wide .screen__frame {
    overflow-x: auto;
    place-items: start;
  }

  .screen--wide .screen__frame img {
    width: 50rem;
    max-width: none;
  }
}

@media (--bp-xs) {
  .steps {
    grid-template-columns: 1fr;
  }

  .steps li {
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--space-4);
    row-gap: var(--space-1);
    padding: var(--space-4);
  }

  .steps__n {
    grid-row: span 2;
    margin-bottom: 0;
  }

  .screen--illustration .screen__frame {
    padding: var(--space-4);
  }

  .figures li {
    padding: var(--space-3);
  }

  .figures span {
    font-size: var(--fs-xs);
  }

  .screen__frame {
    padding: var(--space-3);
  }

  .voice {
    padding-block: var(--space-8);
  }

  .tip {
    padding: var(--space-5);
  }
}
</style>
