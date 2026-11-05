<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import PageHero from '../components/ui/PageHero.vue'
import TickList from '../components/ui/TickList.vue'
import { clubBenefits, clubFigures, eventDay, eventTime, events, nextClub, splitEvents } from '../data/community'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'

const next = events.find((e) => e.id === nextClub.eventId)!
const isUpcoming = computed(() => Date.parse(next.start) >= Date.now())
// The two previous clubs, before the one presented as next.
const pastClubs = computed(() =>
  splitEvents()
    .past.filter((e) => e.kind === 'club' && e.id !== next.id)
    .slice(0, 2),
)
</script>

<template>
  <div>
    <PageHero title-id="club-title">
      <template #title>Le club utilisateurs</template>
      <template #lede>Une communauté de clients qui inspire la roadmap de myCarto.</template>
      <template #actions>
        <BaseButton to="/demo" size="l">Demander une démo</BaseButton>
        <BaseButton :to="{ hash: '#prochain' }" variant="ghost" size="l">Le prochain club</BaseButton>
      </template>
      <template #aside>
        <figure class="visual">
          <img
            src="/brand/club/club-utilisateur.webp"
            alt="Une session du club utilisateurs myCarto, en salle"
            width="1000"
            height="800"
            fetchpriority="high"
          />
        </figure>
      </template>
    </PageHero>

    <!-- The club in three figures: navy band -->
    <section class="figures on-navy" aria-labelledby="t-figures">
      <h2 id="t-figures" class="visually-hidden">Le club en chiffres</h2>
      <ul class="wrap figures__list">
        <li v-for="f in clubFigures" :key="f.value">
          <strong>{{ f.value }}</strong>
          <span>{{ f.label }}</span>
        </li>
      </ul>
    </section>

    <!-- Benefits: cool grey, six framed tiles -->
    <section class="section ground-cool" aria-labelledby="t-benefits">
      <div class="wrap">
        <div class="section-head benefits__head">
          <h2 id="t-benefits">Ce que les membres y gagnent</h2>
          <p>Six raisons d’y revenir, édition après édition.</p>
        </div>
        <ol class="benefits">
          <li v-for="(b, i) in clubBenefits" :key="b.name">
            <span class="benefits__n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ b.name }}</h3>
            <p>{{ b.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- The next club: yellow, its visual beside the programme -->
    <section id="prochain" class="section next" aria-labelledby="t-next">
      <div class="wrap next__grid">
        <figure class="next__visual">
          <img :src="next.image" :alt="`Affiche du ${nextClub.edition}`" width="1084" height="559" loading="lazy" />
        </figure>
        <div>
          <p class="next__date">
            <BaseBadge as="time" :datetime="next.start">{{ eventDay(next.start) }}, {{ eventTime(next.start) }}</BaseBadge>
            <BaseBadge tone="outline">{{ next.place }}</BaseBadge>
          </p>
          <h2 id="t-next">{{ isUpcoming ? 'Le prochain club' : 'Le dernier club' }}</h2>
          <p class="next__line">
            Le {{ nextClub.edition }}, avec le témoignage de {{ nextClub.guest }}.
          </p>
          <div class="next__cols">
            <div>
              <h3>Au programme</h3>
              <TickList :items="nextClub.programme" ground="yellow" size="m" />
            </div>
            <div>
              <h3>Les intervenants</h3>
              <ul class="speakers">
                <li v-for="s in nextClub.speakers" :key="s.name">
                  <strong>{{ s.name }}</strong>
                  {{ s.role }}
                </li>
              </ul>
            </div>
          </div>
          <p class="next__note">{{ nextClub.note }}</p>
        </div>
      </div>
    </section>

    <!-- Previous clubs -->
    <section class="section" aria-labelledby="t-past">
      <div class="wrap">
        <div class="past__head">
          <h2 id="t-past">Les derniers clubs</h2>
          <RouterLink class="link-more" to="/evenements">Tous les événements</RouterLink>
        </div>
        <ul class="past">
          <li v-for="e in pastClubs" :key="e.id">
            <component :is="e.to ? RouterLink : 'div'" class="past__card" v-bind="e.to ? { to: e.to } : {}">
              <img :src="e.image" alt="" width="1084" height="559" loading="lazy" />
              <span class="past__body">
                <time :datetime="e.start">{{ eventDay(e.start, false) }}</time>
                <span class="past__title">{{ e.title }}</span>
                <span class="past__line">{{ e.line }}</span>
              </span>
            </component>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero visual: their club photo on the yellow ground of the home hero frame. */
.visual {
  margin: 0;
  padding: var(--space-6) var(--space-6) 0;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  overflow: hidden;
}

.visual img {
  width: 100%;
  height: auto;
  max-height: calc(100dvh - 15rem);
  object-fit: contain;
  object-position: bottom;
  animation: rise 0.9s var(--ease-out) 0.1s both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

/* Figures */
.figures {
  background: var(--navy);
  padding-block: var(--space-8);
}

.figures__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
}

.figures__list li {
  display: grid;
  align-content: start;
  gap: var(--space-2);
}

.figures__list li + li {
  padding-left: var(--space-6);
  border-left: 1px solid var(--on-navy-line);
}

.figures strong {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-3xl);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--yellow);
}

.figures span {
  max-width: 22ch;
  font-size: var(--fs-l);
  line-height: 1.35;
  color: var(--on-navy-soft);
}

/* Benefits */
.benefits__head {
  margin-inline: auto;
  text-align: center;
}

.benefits__head p {
  margin-inline: auto;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.benefits li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: var(--space-4);
  row-gap: var(--space-1);
  align-items: start;
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.benefits__n {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  padding-top: 0.15em;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1;
}

.benefits h3 {
  font-size: var(--fs-l);
  line-height: 1.2;
}

.benefits p {
  font-size: var(--fs-s);
  line-height: 1.5;
}

/* Next club */
.next {
  background: var(--yellow);
  color: var(--navy);
}

.next__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: var(--space-8);
  align-items: center;
}

.next__visual {
  margin: 0;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
}

.next__visual img {
  width: 100%;
  height: auto;
}

.next__date {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.next h2 {
  font-size: var(--fs-2xl);
}

.next__line {
  margin-top: var(--space-3);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 34ch;
}

.next__cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.next h3 {
  margin-bottom: var(--space-3);
  font-size: var(--fs-l);
}

.speakers {
  display: grid;
  gap: var(--space-3);
}

.speakers li {
  display: grid;
  font-size: var(--fs-s);
  line-height: 1.4;
}

.speakers strong {
  font-family: var(--font-display);
  font-size: var(--fs-m);
}

.next__note {
  margin-top: var(--space-6);
  font-size: var(--fs-s);
  font-weight: 600;
}

/* Past clubs */
.past__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.past__head h2 {
  font-size: var(--fs-2xl);
}

.past {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.past__card {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  height: 100%;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
  color: var(--text);
  text-decoration: none;
}

.past__card img {
  width: 100%;
  height: 100%;
  min-height: 11rem;
  object-fit: cover;
  object-position: right center;
}

.past__body {
  display: grid;
  align-content: center;
  gap: var(--space-1);
  padding: var(--space-5) var(--space-6);
}

.past time {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--text-muted);
}

.past__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  color: var(--navy);
}

.past__line {
  font-size: var(--fs-s);
}

a.past__card:hover .past__title {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

@media (--bp-l) {
  .benefits {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .next__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

/* Two past clubs side by side need the room of a landscape screen. */
@media (--bp-m) {
  .past {
    grid-template-columns: 1fr;
  }
}

@media (--bp-s) {
  .figures__list {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .figures__list li + li {
    padding-left: 0;
    padding-top: var(--space-5);
    border-left: 0;
    border-top: 1px solid var(--on-navy-line);
  }

  .benefits,
  .next__cols,
  .past__card {
    grid-template-columns: 1fr;
  }

  .past__card img {
    min-height: 0;
    aspect-ratio: 16 / 8;
  }
}

@media (--bp-xs) {
  .visual {
    padding: var(--space-4) var(--space-4) 0;
  }

  .past__body {
    padding: var(--space-4);
  }
}
</style>
