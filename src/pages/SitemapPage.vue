<script setup lang="ts">
// Plan du site, built from the same data as the menus (nav.ts), the cases and the articles, so it never drifts.
import PageHero from '../components/ui/PageHero.vue'
import { articles } from '../data/articles'
import { caseStudies as cases } from '../data/cases'
import { companyLinks, legalLinks, navGroups } from '../data/nav'

const groups = [
  ...navGroups.map((g) => ({ label: g.label, links: g.items.filter((i) => !i.external).map((i) => ({ label: i.label, to: i.to })) })),
  { label: 'Entreprise', links: [{ label: 'Accueil', to: '/' }, ...companyLinks] },
  { label: 'Informations', links: legalLinks },
]
</script>

<template>
  <div>
    <PageHero :full="false">
      <template #title>Plan du site</template>
      <template #lede>Toutes les pages de la maquette, en un coup d’œil.</template>
    </PageHero>

    <section class="section ground-cool" aria-label="Toutes les pages">
      <div class="wrap map">
        <div v-for="g in groups" :key="g.label" class="block">
          <h2>{{ g.label }}</h2>
          <ul>
            <li v-for="l in g.links" :key="l.to">
              <RouterLink :to="l.to">{{ l.label }}</RouterLink>
            </li>
          </ul>
        </div>
        <div class="block block--wide">
          <h2>Cas clients</h2>
          <ul class="cols">
            <li v-for="c in cases" :key="c.slug">
              <RouterLink :to="`/clients/${c.slug}`">{{ c.org }}</RouterLink>
            </li>
          </ul>
        </div>
        <div class="block block--wide">
          <h2>Articles</h2>
          <ul class="cols">
            <li v-for="a in articles" :key="a.slug">
              <RouterLink :to="`/ressources/${a.slug}`">{{ a.title }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.map {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
}

.block {
  padding: var(--space-5) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.block--wide {
  grid-column: 1 / -1;
}

.block h2 {
  margin-bottom: var(--space-3);
  font-size: var(--fs-xl);
}

.block li + li {
  border-top: 1px solid var(--line);
}

.cols {
  columns: 2;
  column-gap: var(--space-7);
}

.cols li {
  break-inside: avoid;
}

.cols li + li {
  border-top: 0;
}

.block a {
  display: block;
  padding-block: var(--space-2);
  font-weight: 600;
  color: var(--navy);
  text-decoration: none;
}

.block a:hover {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

@media (max-width: 1000px) {
  .map {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .map {
    grid-template-columns: 1fr;
  }

  .block {
    padding: var(--space-4);
  }

  .cols {
    columns: 1;
  }
}
</style>
