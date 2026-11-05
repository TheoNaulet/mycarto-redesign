<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PageHero from '../components/ui/PageHero.vue'
import EventCountdown from '../components/clients/EventCountdown.vue'
import { eventDay, eventFormats, eventTime, splitEvents } from '../data/community'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'

const { upcoming, past } = splitEvents()
// The hero shows the next date, or the last one when nothing is announced yet.
const featured = upcoming[0] ?? past[0]
const isUpcoming = upcoming.length > 0
const listed = isUpcoming ? past : past.slice(1)
const firstYear = new Date(past[past.length - 1]?.start ?? Date.now()).getFullYear()
</script>

<template>
  <div>
    <PageHero title-id="events-title">
      <template #title>Événements et webinaires</template>
      <template #lede>Clubs utilisateurs, webconférences et salons, en ligne ou sur place.</template>
      <template #actions>
        <BaseButton to="/demo" size="l">Demander une démo</BaseButton>
        <BaseButton to="/club-utilisateurs" variant="ghost" size="l">Le club utilisateurs</BaseButton>
      </template>
      <template #aside>
        <article v-if="featured" class="next" aria-labelledby="t-featured">
          <img :src="featured.image" alt="" width="1084" height="559" fetchpriority="high" />
          <div class="next__body">
            <p class="next__when">
              <BaseBadge as="time" :datetime="featured.start">{{ eventDay(featured.start) }}, {{ eventTime(featured.start) }}</BaseBadge>
              <BaseBadge tone="outline">{{ featured.place }}</BaseBadge>
            </p>
            <h2 id="t-featured">{{ isUpcoming ? 'À venir' : 'Dernier en date' }}&nbsp;: {{ featured.title }}</h2>
            <p class="next__line">{{ featured.line }}</p>
            <EventCountdown v-if="isUpcoming" class="next__countdown" :to="featured.start" />
            <RouterLink v-if="featured.to" class="link-more" :to="featured.to">Voir le programme</RouterLink>
          </div>
        </article>
      </template>
    </PageHero>

    <!-- Past events: cool grey, a framed list -->
    <section class="section ground-cool" aria-labelledby="t-past">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="t-past">Les événements passés</h2>
          <p>{{ listed.length }} rendez-vous depuis {{ firstYear }}.</p>
        </div>
        <ul class="past">
          <li v-for="e in listed" :key="e.id">
            <component :is="e.to ? RouterLink : 'div'" class="past__row" v-bind="e.to ? { to: e.to } : {}">
              <img :src="e.image" alt="" width="1084" height="559" loading="lazy" />
              <span class="past__body">
                <span class="past__when">
                  <time :datetime="e.start">{{ eventDay(e.start, false) }}</time>
                  <span>{{ e.place }}</span>
                </span>
                <span class="past__title">{{ e.title }}</span>
                <span class="past__line">{{ e.line }}</span>
              </span>
            </component>
          </li>
        </ul>
      </div>
    </section>

    <!-- Formats: yellow, three navy plates -->
    <section class="section formats" aria-labelledby="t-formats">
      <div class="wrap">
        <div class="section-head formats__head">
          <h2 id="t-formats">Trois façons de nous rencontrer</h2>
        </div>
        <ul class="formats__list">
          <li v-for="f in eventFormats" :key="f.name">
            <component :is="f.to ? RouterLink : 'div'" class="plate" v-bind="f.to ? { to: f.to } : {}">
              <span class="plate__name">{{ f.name }}</span>
              <span class="plate__line">{{ f.line }}</span>
              <svg v-if="f.to" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </component>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Featured event card in the hero */
.next {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--paper);
}

.next > img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  object-position: right center;
  border-bottom: var(--frame) solid var(--navy);
}

.next__body {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6) var(--space-6);
}

.next__when {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.next h2 {
  font-size: var(--fs-xl);
  line-height: 1.15;
}

.next__line {
  font-size: var(--fs-m);
  max-width: 46ch;
}

.next__countdown {
  width: 100%;
  max-width: 26rem;
  margin-block: var(--space-2);
}

/* Past events */
.past {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-2) var(--space-5);
  background: var(--paper);
}

.past li + li {
  border-top: 1px solid var(--line);
}

.past__row {
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: var(--space-5);
  align-items: center;
  padding-block: var(--space-4);
  color: var(--text);
  text-decoration: none;
}

.past__row img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: right center;
  border-radius: var(--radius-plate);
}

.past__body {
  display: grid;
  gap: 0.2rem;
}

.past__when {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
}

.past__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
  color: var(--navy);
}

.past__line {
  font-size: var(--fs-s);
  line-height: 1.5;
}

a.past__row:hover .past__title {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

/* Formats */
.formats {
  background: var(--yellow);
}

.formats__head {
  margin-inline: auto;
  text-align: center;
}

.formats__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.plate {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-content: start;
  gap: var(--space-2) var(--space-4);
  height: 100%;
  padding: var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--navy);
  color: var(--on-navy-soft);
  text-decoration: none;
}

.plate__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.15;
  color: var(--on-navy);
}

.plate__line {
  grid-column: 1;
  font-size: var(--fs-m);
  line-height: 1.5;
}

.plate svg {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  width: 1.6rem;
  height: 1.6rem;
  fill: none;
  stroke: var(--yellow);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

a.plate:hover .plate__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

a.plate:hover svg {
  transform: translateX(3px);
}

a.plate:focus-visible {
  outline-color: var(--navy);
}

@media (--bp-m) {
  .formats__list {
    grid-template-columns: 1fr;
  }
}

@media (--bp-xs) {
  .next__body {
    padding: var(--space-4) var(--space-4) var(--space-5);
  }

  .past {
    padding: var(--space-1) var(--space-4);
  }

  .past__row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .past__row img {
    aspect-ratio: 16 / 7;
  }

  .plate {
    padding: var(--space-5);
  }
}
</style>
