<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import { candidate, site } from '../data/content'
import { navGroups, type NavGroup } from '../data/nav'

const route = useRoute()
const drawer = ref(false)
const openId = ref<string | null>(null)
const headerEl = ref<HTMLElement | null>(null)

let closeTimer: number | undefined
let hoverOpenedAt = 0
let canHover: MediaQueryList | null = null

function isActive(g: NavGroup) {
  return g.items.some((i) => !i.external && (route.path === i.to || route.path.startsWith(`${i.to}/`)))
}

function hoverOpen(id: string) {
  if (!canHover?.matches) return
  window.clearTimeout(closeTimer)
  if (openId.value !== id) hoverOpenedAt = Date.now()
  openId.value = id
}

function hoverClose() {
  if (!canHover?.matches) return
  closeTimer = window.setTimeout(() => (openId.value = null), 180)
}

function toggle(id: string) {
  // A click right after the hover opened the panel keeps it open instead of closing it.
  if (openId.value === id && Date.now() - hoverOpenedAt < 400) return
  openId.value = openId.value === id ? null : id
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !openId.value) return
  const id = openId.value
  openId.value = null
  nextTick(() => document.getElementById(`menu-${id}`)?.focus())
}

function onPointer(e: PointerEvent) {
  if (openId.value && headerEl.value && !headerEl.value.contains(e.target as Node)) openId.value = null
}

watch(
  () => route.fullPath,
  () => {
    openId.value = null
    drawer.value = false
  },
)

onMounted(() => {
  canHover = window.matchMedia('(hover: hover) and (min-width: 961px)')
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onPointer)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointer)
  window.clearTimeout(closeTimer)
})
</script>

<template>
  <div class="notice">
    <p class="wrap">
      Concept de refonte non officiel, proposé par {{ candidate.name }} pour une candidature.
      <a :href="site.official" rel="noopener">Voir le site officiel</a>
    </p>
  </div>
  <header ref="headerEl" class="header">
    <div class="wrap header__bar">
      <RouterLink class="header__logo" to="/" aria-label="myCarto, accueil">
        <BrandLogo />
      </RouterLink>
      <button
        type="button"
        class="header__toggle"
        :aria-expanded="drawer"
        aria-controls="main-nav"
        @click="drawer = !drawer"
      >
        <span class="visually-hidden">Menu</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path v-if="!drawer" d="M4 7h16M4 12h16M4 17h16" />
          <path v-else d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <nav id="main-nav" class="header__nav" :class="{ 'is-open': drawer }" aria-label="Navigation principale">
        <ul class="menu">
          <li
            v-for="g in navGroups"
            :key="g.id"
            class="menu__group"
            @mouseenter="hoverOpen(g.id)"
            @mouseleave="hoverClose"
          >
            <button
              :id="`menu-${g.id}`"
              type="button"
              class="menu__trigger"
              :class="{ 'is-active': isActive(g), 'is-open': openId === g.id }"
              :aria-expanded="openId === g.id"
              :aria-controls="`panel-${g.id}`"
              @click="toggle(g.id)"
            >
              {{ g.label }}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <Transition name="drop">
              <div v-show="openId === g.id" :id="`panel-${g.id}`" class="menu__panel">
                <ul>
                  <li v-for="item in g.items" :key="item.to">
                    <a v-if="item.external" class="menu__item" :href="item.to" rel="noopener">
                      <img :src="`/brand/nav/${item.icon}.svg`" alt="" width="44" height="44" />
                      <span class="menu__name">{{ item.label }} <span class="menu__ext" aria-hidden="true">↗</span></span>
                      <span class="menu__line">{{ item.line }}</span>
                    </a>
                    <RouterLink v-else class="menu__item" :to="item.to">
                      <img :src="`/brand/nav/${item.icon}.svg`" alt="" width="44" height="44" />
                      <span class="menu__name">{{ item.label }}</span>
                      <span class="menu__line">{{ item.line }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </Transition>
          </li>
          <li class="menu__group">
            <RouterLink class="menu__trigger menu__trigger--link" to="/a-propos">À propos</RouterLink>
          </li>
        </ul>
        <div class="header__actions">
          <RouterLink class="btn btn--ghost" to="/contact">Contact commercial</RouterLink>
          <RouterLink class="btn btn--primary" to="/demo">Demander une démo</RouterLink>
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
  position: relative;
  z-index: 30;
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

.menu {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.menu__group {
  position: relative;
}

.menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0;
  border: 0;
  background: linear-gradient(var(--yellow), var(--yellow)) left bottom / 0 2px no-repeat;
  font-weight: 600;
  font-size: var(--fs-s);
  color: var(--navy);
  text-decoration: none;
  transition: background-size 0.25s var(--ease-out);
}

.menu__trigger svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

.menu__trigger:hover,
.menu__trigger.is-open,
.menu__trigger.is-active,
.menu__trigger--link.router-link-active {
  background-size: 100% 2px;
}

.menu__trigger.is-open svg {
  transform: rotate(180deg);
}

/* The dropdown is a small legend: the 3px navy frame and hairline rows of the key list. */
.menu__panel {
  position: absolute;
  top: calc(100% + 1.05rem);
  left: -1.25rem;
  width: 25rem;
  padding: var(--space-1) var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

/* Keeps the panel open while the pointer crosses the gap under the trigger. */
.menu__panel::before {
  content: '';
  position: absolute;
  inset: -1.25rem 0 100%;
}

.menu__panel li + li {
  border-top: 1px solid var(--line);
}

.menu__item {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  grid-template-areas:
    'icon name'
    'icon line';
  column-gap: var(--space-4);
  align-items: center;
  padding-block: var(--space-3);
  color: var(--navy);
  text-decoration: none;
}

.menu__item img {
  grid-area: icon;
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.menu__name {
  grid-area: name;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1.25;
}

.menu__ext {
  font-family: var(--font-text);
  font-weight: 600;
  font-size: var(--fs-s);
}

.menu__line {
  grid-area: line;
  font-size: var(--fs-s);
  line-height: 1.4;
  color: var(--text);
}

.menu__item:hover .menu__name,
.menu__item.router-link-active .menu__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

@media (max-width: 1240px) {
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
    max-height: calc(100dvh - 6.8rem);
    overflow-y: auto;
    padding: var(--space-3) var(--gutter) var(--space-6);
    background: var(--paper);
    border-bottom: var(--frame) solid var(--navy);
  }

  .header__nav.is-open {
    display: flex;
  }

  .menu {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .menu__group + .menu__group {
    border-top: 1px solid var(--line);
  }

  .menu__trigger {
    width: 100%;
    justify-content: space-between;
    padding-block: 0.85rem;
    background: none;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--fs-l);
  }

  .menu__panel {
    position: static;
    width: auto;
    padding: 0 0 var(--space-3);
    border: 0;
    border-radius: 0;
  }

  .menu__panel::before {
    display: none;
  }

  .menu__panel li + li {
    border-top: 0;
  }

  .menu__item {
    padding-block: var(--space-2);
  }

  .header__actions {
    flex-direction: column;
  }

  .header__actions .btn--ghost {
    display: inline-flex;
  }
}
</style>
