<script setup lang="ts">
// Footer: contact details, one column per menu group (from nav.ts), legal links and the concept notice.
import BrandLogo from './BrandLogo.vue'
import { candidate, site } from '../data/content'
import { companyLinks, legalLinks, navGroups } from '../data/nav'

const columns = [
  ...navGroups.map((g) => ({ label: g.label, links: g.items.map((i) => ({ label: i.label, to: i.to, external: i.external })) })),
  { label: 'Entreprise', links: companyLinks.map((l) => ({ ...l, external: false })) },
]
</script>

<template>
  <footer class="footer on-navy">
    <div class="wrap footer__top">
      <div class="footer__brand">
        <span class="footer__logo"><BrandLogo /></span>
        <p>Éditeur français, AB+ Software, depuis 2006.</p>
        <p class="footer__address">
          {{ site.address.join(', ') }}<br />
          <a :href="site.phoneHref">{{ site.phone }}</a>
        </p>
      </div>
      <nav class="footer__cols" aria-label="Plan du site">
        <div v-for="col in columns" :key="col.label" class="footer__col">
          <h2>{{ col.label }}</h2>
          <ul>
            <li v-for="l in col.links" :key="l.to">
              <a v-if="l.external" :href="l.to" rel="noopener">{{ l.label }}</a>
              <RouterLink v-else :to="l.to">{{ l.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="wrap footer__bottom">
      <ul class="footer__legal">
        <li v-for="l in legalLinks" :key="l.to">
          <RouterLink :to="l.to">{{ l.label }}</RouterLink>
        </li>
        <li><a :href="site.linkedin" rel="noopener">LinkedIn</a></li>
      </ul>
      <p class="footer__concept">
        Maquette de refonte réalisée par {{ candidate.name }}, {{ candidate.role.charAt(0).toLowerCase() + candidate.role.slice(1) }}, en Vue 3.
        Ce n’est pas le site officiel. myCarto, son logo, ses visuels, ses textes et les logos clients appartiennent à leurs propriétaires.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  --logo-ink: #ffffff;
  --logo-accent: #6fb4e6;
  background: var(--navy-deep);
  padding-block: var(--space-8) var(--space-5);
  font-size: var(--fs-s);
}

.footer__top {
  display: grid;
  grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 2fr);
  gap: var(--space-7);
  padding-bottom: var(--space-7);
  border-bottom: 1px solid var(--on-navy-line);
}

.footer__brand {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  color: var(--on-navy-soft);
}

.footer__logo {
  display: block;
  height: 2.3rem;
  margin-bottom: var(--space-2);
}

.footer__address a {
  color: var(--on-navy);
  font-weight: 600;
}

.footer__cols {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-5);
}

.footer__col h2 {
  margin-bottom: var(--space-3);
  font-size: var(--fs-m);
  color: var(--yellow);
}

.footer__col ul {
  display: grid;
  gap: var(--space-2);
}

.footer__col a,
.footer__legal a {
  color: var(--on-navy-soft);
  text-decoration: none;
}

.footer__col a:hover,
.footer__legal a:hover,
.footer__col a.router-link-exact-active {
  color: var(--on-navy);
  text-decoration: underline;
}

.footer__bottom {
  display: grid;
  gap: var(--space-4);
  padding-top: var(--space-5);
}

.footer__legal {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}

.footer__concept {
  max-width: 80ch;
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
}

@media (max-width: 1100px) {
  .footer__top {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .footer__cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-6) var(--space-5);
  }
}
</style>
