<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import KeyList from '../components/ui/KeyList.vue'
import TickList from '../components/ui/TickList.vue'
import UsersAppsChart from '../components/product/UsersAppsChart.vue'
import { alwaysIncluded, extraServices, plans, pricingPrinciple, purchasingCentres } from '../data/product'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'

const principleKeys = pricingPrinciple.map((p) => ({ name: p.name, line: p.line, icon: `/brand/nav/${p.icon}.svg` }))
</script>

<template>
  <div>
    <PageHero title-id="pricing-title">
      <template #title>Une offre pour chaque maturité</template>
      <template #lede>Vous payez des utilisateurs, pas des applications : votre cartographie, elle, reste illimitée.</template>
      <template #actions>
        <BaseButton to="/demo" size="l">Demander une démo</BaseButton>
        <BaseButton to="/contact" variant="ghost" size="l">Demander un devis</BaseButton>
      </template>
      <template #aside>
        <UsersAppsChart />
      </template>
    </PageHero>

    <!-- Plans: cool grey, three cards, Premium in navy -->
    <section class="section plans-section" aria-labelledby="plans-title">
      <div class="wrap">
        <div class="section-head plans__head">
          <h2 id="plans-title">Trois formules</h2>
          <p>Toutes sur devis, estimé sous 24 h selon vos utilisateurs.</p>
        </div>
        <ul class="plans">
          <li v-for="p in plans" :key="p.id" class="plan" :class="{ 'plan--featured on-navy': p.featured }">
            <BaseBadge v-if="p.featured" class="plan__badge" tone="yellow">Plébiscité</BaseBadge>
            <h3>{{ p.name }}</h3>
            <p class="plan__for">{{ p.forWhom }}</p>
            <p class="plan__intro">{{ p.intro }}</p>
            <TickList :items="p.points" size="m" :ground="p.featured ? 'navy' : 'light'" />
            <div v-if="p.options" class="plan__options">
              <span class="plan__options-label">En option</span>
              <ul>
                <BaseBadge v-for="o in p.options" :key="o" as="li" size="s">{{ o }}</BaseBadge>
              </ul>
            </div>
            <p v-if="p.note" class="plan__note">{{ p.note }}</p>
            <BaseButton class="plan__cta" to="/contact" variant="ghost">Demander un devis</BaseButton>
          </li>
        </ul>
      </div>
    </section>

    <!-- Principle: paper, the three pricing keys and what's always included -->
    <section class="section" aria-labelledby="principle-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="principle-title">Le principe</h2>
          <p>Le nombre d’utilisateurs grandit moins vite que le SI : votre budget reste maîtrisé.</p>
        </div>
        <div class="principle">
          <KeyList :items="principleKeys" />
          <div class="included">
            <h3>Toujours inclus</h3>
            <TickList :items="alwaysIncluded" size="m" ground="yellow" />
          </div>
        </div>
      </div>
    </section>

    <!-- Extra services: navy rows -->
    <section class="section extras on-navy" aria-labelledby="extras-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="extras-title">Services complémentaires</h2>
          <p>Au-delà du standard, à la demande.</p>
        </div>
        <dl class="extras__list">
          <div v-for="s in extraServices" :key="s.name" class="extras__row">
            <dt>{{ s.name }}</dt>
            <dd>
              {{ s.line }}
              <RouterLink v-if="s.to" class="extras__link" :to="s.to">Voir la méthode</RouterLink>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Purchasing centres: paper, their logos -->
    <section class="section centres" aria-labelledby="centres-title">
      <div class="wrap">
        <div class="section-head centres__head">
          <h2 id="centres-title">Au catalogue des centrales d’achat</h2>
          <p>Tarifs négociés et procédures simplifiées pour le secteur public.</p>
        </div>
        <ul class="centres__logos">
          <li v-for="c in purchasingCentres" :key="c.file">
            <img :src="`/brand/product/centrales/${c.file}.svg`" :alt="c.name" width="240" height="140" loading="lazy" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Plans */
.plans-section {
  background: var(--paper-cool);
}

.plans__head {
  margin-inline: auto;
  text-align: center;
}

.plans__head p {
  margin-inline: auto;
}

.plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  align-items: start;
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.plan--featured {
  background: var(--navy);
}

.plan__badge {
  position: absolute;
  top: calc(-1 * var(--space-4));
  left: var(--space-6);
}

.plan h3 {
  font-size: var(--fs-2xl);
}

.plan--featured h3 {
  margin-top: var(--space-2);
}

.plan__for {
  margin-top: var(--space-2);
  font-size: var(--fs-s);
  min-height: 3em;
}

.plan--featured .plan__for {
  color: var(--on-navy-soft);
}

.plan__intro {
  margin: var(--space-5) 0 var(--space-4);
  padding-top: var(--space-5);
  border-top: 1px solid var(--line);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
}

.plan--featured .plan__intro {
  border-top-color: var(--on-navy-line);
  color: var(--yellow);
}

.plan__options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-5);
}

.plan__options-label {
  margin-right: var(--space-1);
  font-weight: 600;
  font-size: var(--fs-s);
  color: var(--navy);
}

.plan__options ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.plan__note {
  margin-top: var(--space-5);
  font-size: var(--fs-s);
  color: var(--text-muted);
}

.plan__cta {
  align-self: flex-start;
}

/* Space before the button, after whatever comes last in the card. */
.plan > :nth-last-child(2) {
  margin-bottom: var(--space-6);
}

/* Principle */
.principle {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: var(--space-5);
  align-items: stretch;
}

.included {
  padding: var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--yellow);
}

.included h3 {
  margin-bottom: var(--space-5);
  font-size: var(--fs-xl);
}

/* Extras */
.extras {
  background: var(--navy);
}

.extras .section-head p {
  color: var(--on-navy-soft);
}

.extras__list {
  margin: 0;
}

.extras__row {
  display: grid;
  grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 1.4fr);
  gap: var(--space-5);
  padding-block: var(--space-4);
}

.extras__row + .extras__row {
  border-top: 1px solid var(--on-navy-line);
}

.extras__row dt {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.25;
}

.extras__row dd {
  margin: 0;
  color: var(--on-navy-soft);
}

.extras__link {
  margin-left: 0.35em;
  font-weight: 600;
  color: var(--yellow);
}

/* Centres */
.centres__head {
  margin-inline: auto;
  text-align: center;
}

.centres__head p {
  margin-inline: auto;
}

.centres__logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
}

.centres__logos li {
  flex: 0 1 11.5rem;
  display: grid;
  place-items: center;
  height: 6.5rem;
  border: 2px solid var(--line);
  border-radius: var(--radius-panel);
}

.centres__logos img {
  width: 100%;
  height: 100%;
  padding: 0.75rem 1rem;
  object-fit: contain;
}

@media (--bp-l) {
  .plans {
    grid-template-columns: 1fr;
    max-width: 38rem;
    margin-inline: auto;
    gap: var(--space-7);
  }

  .plan__for {
    min-height: 0;
  }
}

@media (--bp-m) {
  .principle {
    grid-template-columns: 1fr;
  }
}

@media (--bp-s) {
  .plan {
    padding: var(--space-5);
  }

  .extras__row {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  .centres__logos {
    gap: var(--space-3);
  }

  .centres__logos li {
    flex-basis: calc(50% - var(--space-3));
    height: 5rem;
  }
}
</style>
