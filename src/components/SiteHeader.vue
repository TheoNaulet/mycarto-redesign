<script setup lang="ts">
import { ref } from 'vue'
import BrandLogo from './BrandLogo.vue'
import { candidate, site } from '../data/content'

const open = ref(false)
const nav = [
  { href: '#usages', label: 'Usages' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#accompagnement', label: 'Accompagnement' },
  { href: '#club', label: 'Club' },
]
</script>

<template>
  <div class="notice">
    <p class="wrap">
      Concept de refonte non officiel, proposé par {{ candidate.name }} pour une candidature.
      <a :href="site.official" rel="noopener">Voir le site officiel</a>
    </p>
  </div>
  <header class="header">
    <div class="wrap header__bar">
      <a class="header__logo" href="#top" aria-label="myCarto, retour en haut">
        <BrandLogo />
      </a>
      <button
        type="button"
        class="header__toggle"
        :aria-expanded="open"
        aria-controls="main-nav"
        @click="open = !open"
      >
        <span class="visually-hidden">Menu</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" />
          <path v-else d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <nav id="main-nav" class="header__nav" :class="{ 'is-open': open }" aria-label="Navigation principale">
        <ul>
          <li v-for="item in nav" :key="item.href">
            <a :href="item.href" @click="open = false">{{ item.label }}</a>
          </li>
        </ul>
        <div class="header__actions">
          <a class="btn btn--ghost" :href="site.contact">Contact commercial</a>
          <a class="btn btn--primary" :href="site.demo">Demander une démo</a>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.notice {
  background: var(--navy-deep);
  color: var(--on-navy-soft);
  font-size: var(--fs-xs);
  line-height: 1.4;
}

.notice p {
  padding-block: 0.55rem;
}

.notice a {
  color: var(--yellow);
  font-weight: 600;
  margin-left: 0.35em;
}

.header {
  background: var(--paper);
  color: var(--navy);
  border-bottom: 1px solid var(--line);
}

.header__actions .btn--ghost:hover {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--on-navy);
}

.header__bar {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  min-height: 4.5rem;
}

.header__logo {
  height: 2.6rem;
  flex: none;
  border-radius: 4px;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-left: auto;
}

.header__nav ul {
  display: flex;
  gap: var(--space-5);
}

.header__nav ul a {
  font-weight: 600;
  font-size: var(--fs-s);
  text-decoration: none;
  padding-block: 0.4rem;
  background: linear-gradient(var(--yellow), var(--yellow)) left bottom / 0 2px no-repeat;
  transition: background-size 0.25s var(--ease-out);
}

.header__nav ul a:hover {
  background-size: 100% 2px;
}

.header__actions {
  display: flex;
  gap: var(--space-3);
}

.header__actions .btn {
  min-height: 2.75rem;
  font-size: var(--fs-s);
}

.header__toggle {
  display: none;
  margin-left: auto;
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--line);
  border-radius: 50%;
  background: transparent;
}

.header__toggle svg {
  width: 1.3rem;
  height: 1.3rem;
  margin: auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
}

@media (max-width: 1180px) {
  .header__nav ul {
    gap: var(--space-4);
  }

  .header__actions .btn--ghost {
    display: none;
  }
}

@media (max-width: 960px) {
  .header__toggle {
    display: grid;
  }

  .header__nav {
    display: none;
    position: absolute;
    inset: 100% 0 auto;
    z-index: 10;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-5);
    padding: var(--space-5) var(--gutter) var(--space-6);
    background: var(--paper);
    border-bottom: var(--frame) solid var(--navy);
  }

  .header__nav.is-open {
    display: flex;
  }

  .header {
    position: relative;
  }

  .header__nav ul {
    flex-direction: column;
    gap: var(--space-1);
  }

  .header__nav ul a {
    display: block;
    font-size: var(--fs-l);
    font-family: var(--font-display);
    padding-block: 0.6rem;
  }

  .header__actions {
    flex-direction: column;
  }

  .header__actions .btn--ghost {
    display: inline-flex;
  }
}
</style>
