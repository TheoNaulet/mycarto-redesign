<script setup lang="ts">
import BrandLogo from './BrandLogo.vue'
import { candidate, site } from '../data/content'
</script>

<template>
  <footer class="footer on-navy">
    <div class="wrap footer__inner">
      <div class="footer__brand">
        <span class="footer__logo"><BrandLogo /></span>
        <p>Éditeur français, AB+ Software, depuis 2006.</p>
      </div>
      <ul class="footer__links">
        <li><a :href="site.linkedin" rel="noopener">LinkedIn</a></li>
        <li><a :href="site.legal">Mentions légales</a></li>
        <li><a :href="site.privacy">Politique RGPD</a></li>
      </ul>
    </div>
    <div class="wrap footer__concept">
      <p>
        Maquette de refonte réalisée par {{ candidate.name }}, {{ candidate.role.toLowerCase() }}, en Vue 3.
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
  padding-block: var(--space-6) var(--space-5);
  font-size: var(--fs-s);
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--on-navy-line);
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  color: var(--on-navy-soft);
}

.footer__logo {
  display: block;
  height: 2.3rem;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
}

.footer__links a {
  text-decoration: none;
}

.footer__links a:hover {
  text-decoration: underline;
}

.footer__concept p {
  padding-top: var(--space-4);
  max-width: 80ch;
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
}

@media (max-width: 640px) {
  .footer__brand {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
}
</style>
