<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHero from '../components/ui/PageHero.vue'
import { faq } from '../data/faq'
import BaseButton from '../components/ui/BaseButton.vue'

const query = ref('')
const open = ref<Set<string>>(new Set([faq[0].items[0].q]))

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const total = faq.reduce((n, t) => n + t.items.length, 0)

const themes = computed(() => {
  const words = norm(query.value).split(/\s+/).filter(Boolean)
  if (!words.length) return faq
  return faq
    .map((t) => ({
      ...t,
      items: t.items.filter((i) => {
        const hay = norm([i.q, i.a, ...(i.list ?? []), ...(i.pills ?? [])].join(' '))
        return words.every((w) => hay.includes(w))
      }),
    }))
    .filter((t) => t.items.length)
})

const found = computed(() => themes.value.reduce((n, t) => n + t.items.length, 0))

function toggle(q: string) {
  const next = new Set(open.value)
  if (next.has(q)) next.delete(q)
  else next.add(q)
  open.value = next
}

// While searching, every matching answer shows.
const isOpen = (q: string) => !!query.value.trim() || open.value.has(q)
const idOf = (q: string) => `a-${norm(q).replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`
</script>

<template>
  <div>
    <PageHero :full="false">
      <template #title>Une question&nbsp;? La réponse en deux lignes.</template>
      <template #lede>Les {{ total }} questions qu’on nous pose le plus, rangées par thème.</template>
      <form class="search" role="search" @submit.prevent>
        <label for="faq-q" class="visually-hidden">Rechercher une question</label>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
        <input id="faq-q" v-model="query" type="search" placeholder="NIS2, CMDB, tarif, formation…" autocomplete="off" />
      </form>
      <template #aside>
        <img
          class="hero-visual"
          src="/brand/product/faq.webp"
          alt="Un utilisateur de myCarto, une question à la main"
          width="1100"
          height="1100"
        />
      </template>
    </PageHero>

    <section class="section ground-cool" aria-label="Questions par thème">
      <div class="wrap faq">
        <nav class="themes" aria-label="Thèmes">
          <a v-for="t in themes" :key="t.id" :href="`#${t.id}`" class="themes__link">
            <img :src="t.icon" alt="" width="40" height="40" />
            <span>{{ t.name }}</span>
            <span class="themes__count">{{ t.items.length }}</span>
          </a>
        </nav>

        <div class="panels">
          <p v-if="query.trim()" class="found" role="status">
            {{ found }} question{{ found > 1 ? 's' : '' }} pour « {{ query.trim() }} »
          </p>

          <section v-for="t in themes" :id="t.id" :key="t.id" class="theme" :aria-labelledby="`h-${t.id}`">
            <h2 :id="`h-${t.id}`">{{ t.name }}</h2>
            <ul class="qa">
              <li v-for="item in t.items" :key="item.q">
                <h3>
                  <button
                    :id="`q-${idOf(item.q)}`"
                    type="button"
                    class="qa__q"
                    :aria-expanded="isOpen(item.q)"
                    :aria-controls="idOf(item.q)"
                    @click="toggle(item.q)"
                  >
                    {{ item.q }}
                    <span class="qa__sign" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  :id="idOf(item.q)"
                  class="qa__a"
                  :class="{ 'is-open': isOpen(item.q) }"
                  role="region"
                  :aria-labelledby="`q-${idOf(item.q)}`"
                >
                  <div class="qa__inner">
                    <p>{{ item.a }}</p>
                    <ul v-if="item.list" class="qa__list">
                      <li v-for="l in item.list" :key="l">{{ l }}</li>
                    </ul>
                    <ul v-if="item.pills" class="qa__pills">
                      <li v-for="p in item.pills" :key="p">{{ p }}</li>
                    </ul>
                    <RouterLink v-if="item.link" class="link-more qa__link" :to="item.link.to">{{ item.link.label }}</RouterLink>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <div v-if="!themes.length" class="empty">
            <h2>Pas encore de réponse à celle-là.</h2>
            <p>Posez-la directement à l’équipe, elle vous répond.</p>
            <BaseButton to="/contact">Poser ma question</BaseButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-visual {
  width: 100%;
  max-width: 24rem;
  height: auto;
  margin-inline: auto;
}

.search {
  position: relative;
  max-width: 30rem;
  margin-top: var(--space-6);
}

.search svg {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  width: 1.4rem;
  height: 1.4rem;
  transform: translateY(-50%);
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.4;
  stroke-linecap: round;
  pointer-events: none;
}

.search input {
  width: 100%;
  min-height: 3.5rem;
  padding: 0.75rem 1.25rem 0.7rem 3.2rem;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-pill);
  background: var(--paper);
  font-size: var(--fs-m);
}

.search input::placeholder {
  color: var(--placeholder);
}

.search input:focus-visible {
  outline: 3px solid var(--yellow);
  outline-offset: 3px;
}

.faq {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr);
  gap: var(--space-7);
  align-items: start;
}

.themes {
  position: sticky;
  top: calc(var(--header-h) + var(--space-5));
  display: grid;
  gap: var(--space-1);
}

.themes__link {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-plate);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1.25;
  color: var(--navy);
  text-decoration: none;
  transition: background-color 0.2s var(--ease-out);
}

.themes__link:hover {
  background: var(--paper);
}

.themes__link img {
  width: 2.5rem;
  height: 2.5rem;
}

.themes__count {
  min-width: 1.8rem;
  padding: 0.3rem 0.5rem 0.25rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-size: var(--fs-xs);
  text-align: center;
}

.panels {
  display: grid;
  gap: var(--space-7);
}

.found {
  font-weight: 600;
  color: var(--navy);
}

.theme {
  scroll-margin-top: var(--space-5);
}

.theme h2 {
  margin-bottom: var(--space-4);
  font-size: var(--fs-xl);
}

/* Each theme is a framed list, the questions on hairlines, like the legend. */
.qa {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-1) var(--space-6);
  background: var(--paper);
}

.qa > li + li {
  border-top: 1px solid var(--line);
}

.qa h3 {
  font-size: inherit;
}

.qa__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  width: 100%;
  padding: var(--space-4) 0;
  border: 0;
  background: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.25;
  color: var(--navy);
  text-align: left;
}

.qa__q:hover {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

/* A plus that turns into a minus, in a yellow disc. */
.qa__sign {
  position: relative;
  flex: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--yellow);
}

.qa__sign::before,
.qa__sign::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.85rem;
  height: 2.5px;
  border-radius: 2px;
  background: var(--navy);
  transform: translate(-50%, -50%);
  transition: transform 0.25s var(--ease-out);
}

.qa__sign::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.qa__q[aria-expanded='true'] .qa__sign::after {
  transform: translate(-50%, -50%) rotate(0deg);
}

.qa__a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s var(--ease-out);
}

.qa__a.is-open {
  grid-template-rows: 1fr;
}

.qa__inner {
  overflow: hidden;
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  max-width: 62ch;
}

.qa__a.is-open .qa__inner {
  padding-bottom: var(--space-5);
}

.qa__a:not(.is-open) .qa__inner {
  visibility: hidden;
}

.qa__inner p {
  font-size: var(--fs-m);
}

.qa__list {
  display: grid;
  gap: var(--space-2);
}

.qa__list li {
  display: flex;
  gap: var(--space-3);
  font-size: var(--fs-s);
}

.qa__list li::before {
  content: '';
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  margin-top: 0.1rem;
  border-radius: 50%;
  background: var(--yellow)
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="%23262e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    center / 70% no-repeat;
}

.qa__pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.qa__pills li {
  padding: 0.45rem 0.9rem 0.4rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1;
}

.qa__link {
  color: var(--navy);
}

.empty {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding: var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.empty h2 {
  font-size: var(--fs-xl);
}

@media (--bp-l) {
  .hero-visual {
    max-width: 15rem;
  }

  .faq {
    grid-template-columns: 1fr;
  }

  .themes {
    display: none;
  }
}

@media (--bp-s) {
  .hero-visual {
    display: none;
  }
}

@media (--bp-xs) {
  .qa {
    padding: var(--space-1) var(--space-4);
  }

  .qa__q {
    font-size: var(--fs-m);
  }
}
</style>
