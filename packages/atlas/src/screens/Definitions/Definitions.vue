<script setup lang="ts">
// Écran « Définitions » : glossaire des notions de myCarto. Recherche, filtre par couche, index alphabétique,
// et pour chaque notion un lien « Voir » vers l'écran où elle se voit.
import { computed, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { goPath, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { definitions, type Definition } from '../../data/definitions'
import type { Layer } from '../../utils/types'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const initial = (s: string) => norm(s).charAt(0).toUpperCase()

/* ---------- Filtres ---------- */
type Couche = Layer | 'transverse'
const COUCHES: { value: Couche; label: string }[] = [
  { value: 'metier', label: 'Métier' },
  { value: 'fonctionnel', label: 'Fonctionnelle' },
  { value: 'applicatif', label: 'Applicative' },
  { value: 'technique', label: 'Technique' },
  { value: 'transverse', label: 'Transverses' },
]
const coucheOf = (d: Definition): Couche => d.layer ?? 'transverse'
const query = ref('')
const couche = ref<Couche | 'toutes'>('toutes')
const letter = ref<string | null>(null)

const bySearch = computed(() => {
  const q = norm(query.value.trim())
  return q ? definitions.filter((d) => norm(`${d.term} ${(d.aliases ?? []).join(' ')} ${d.definition} ${d.exemple ?? ''}`).includes(q)) : definitions
})
const byCouche = computed(() => (couche.value === 'toutes' ? bySearch.value : bySearch.value.filter((d) => coucheOf(d) === couche.value)))
const filtered = computed(() => {
  const list = letter.value ? byCouche.value.filter((d) => initial(d.term) === letter.value) : byCouche.value
  return [...list].sort((a, b) => a.term.localeCompare(b.term, 'fr', { sensitivity: 'base' }))
})
const groups = computed(() => {
  const out: { letter: string; items: Definition[] }[] = []
  for (const d of filtered.value) {
    const l = initial(d.term)
    const g = out.find((x) => x.letter === l)
    if (g) g.items.push(d)
    else out.push({ letter: l, items: [d] })
  }
  return out
})
const counts = computed(() => Object.fromEntries(COUCHES.map((c) => [c.value, bySearch.value.filter((d) => coucheOf(d) === c.value).length])) as Record<Couche, number>)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const available = computed(() => new Set(byCouche.value.map((d) => initial(d.term))))
function pickLetter(l: string) {
  letter.value = letter.value === l ? null : l
}
function setCouche(c: Couche | 'toutes') {
  couche.value = c
  if (letter.value && !available.value.has(letter.value)) letter.value = null
}
function clearAll() {
  query.value = ''
  couche.value = 'toutes'
  letter.value = null
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'notion', 'notions') : 'Aucune notion') : undefined))

/** Mots de la recherche retrouvés dans les autres noms d'une notion. */
function aliasMatch(d: Definition): string | undefined {
  const q = norm(query.value.trim())
  if (!q || norm(d.term).includes(q)) return undefined
  return d.aliases?.find((a) => norm(a).includes(q))
}

/** Notions qui ont désormais leur propre écran : le lien « Voir » y mène directement. */
const OWN_SCREEN: Record<string, { path: string; screen: string }> = {
  Machine: { path: '/machines', screen: 'les machines' },
  Site: { path: '/sites', screen: 'les sites' },
}
const see = (d: Definition) => OWN_SCREEN[d.term] ?? { path: d.path, screen: d.screen }

function follow(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Définitions' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
</script>

<template>
  <div class="mc-scr-def">
    <McAppBar class="mc-scr-def-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true" />

    <div class="mc-scr-def-wrap">
      <main class="mc-scr-def-main">
        <header class="mc-scr-def-head">
          <div class="mc-scr-def-titles">
            <p class="mc-over">Glossaire</p>
            <h1 class="title-lg">Définitions <span class="mc-scr-def-n">{{ filtered.length }}</span></h1>
            <p class="mc-scr-def-lede">Les mots de myCarto, en une phrase chacun, avec l’écran où les retrouver.</p>
          </div>
          <McSearchField v-model="query" class="mc-scr-def-search" placeholder="Rechercher une notion" :count="searchCount" />
        </header>

        <div class="mc-scr-def-filters">
          <div class="mc-row mc-scr-def-chips" role="group" aria-label="Couche">
            <McFilterChip v-if="couche === 'toutes'" :label="`Toutes · ${bySearch.length}`" :removable="false" />
            <button v-else type="button" class="mc-scr-def-chip" @click="setCouche('toutes')"><McStatusChip>Toutes · {{ bySearch.length }}</McStatusChip></button>
            <template v-for="c in COUCHES" :key="c.value">
              <McFilterChip v-if="couche === c.value" :label="`${c.label} · ${counts[c.value]}`" @remove="setCouche('toutes')" />
              <button v-else type="button" class="mc-scr-def-chip" :disabled="!counts[c.value]" @click="setCouche(c.value)">
                <span class="mc-scr-def-pill" :class="`l-${c.value}`"><i aria-hidden="true" />{{ c.label }} · {{ counts[c.value] }}</span>
              </button>
            </template>
          </div>
          <span class="mc-scr-def-grow" />
          <nav class="mc-scr-def-alpha" aria-label="Aller à la lettre">
            <template v-for="l in alphabet" :key="l">
              <button v-if="available.has(l)" type="button" :class="{ 'is-on': letter === l }" :aria-pressed="letter === l" :aria-label="`Notions en ${l}`" @click="pickLetter(l)">{{ l }}</button>
              <span v-else aria-hidden="true">{{ l }}</span>
            </template>
          </nav>
        </div>

        <div v-if="groups.length" class="mc-scr-def-list">
          <section v-for="g in groups" :key="g.letter" class="mc-scr-def-group" :aria-label="`Lettre ${g.letter}`">
            <h2 class="mc-scr-def-letter">{{ g.letter }}</h2>
            <ul class="mc-scr-def-items">
              <li v-for="d in g.items" :key="d.term" class="mc-scr-def-item">
                <span class="mc-scr-def-tile" :class="`l-${coucheOf(d)}`" aria-hidden="true"><McIcon :name="d.icon" /></span>
                <h3 class="mc-scr-def-term">
                  {{ d.term }}
                  <span v-if="aliasMatch(d)" class="mc-scr-def-alias">aussi : {{ aliasMatch(d) }}</span>
                </h3>
                <p class="mc-scr-def-text">
                  {{ d.definition }}
                  <span v-if="d.exemple" class="mc-scr-def-ex">Exemple : {{ d.exemple }}</span>
                </p>
                <div class="mc-scr-def-see">
                  <a :href="pathHref(see(d).path)" :title="`Voir ${see(d).screen}`" @click="follow($event, see(d).path)">Voir {{ see(d).screen }}<McIcon name="arrow-right" size="sm" /></a>
                </div>
              </li>
            </ul>
          </section>
        </div>
        <McEmptyState v-else icon="search" layer="fonctionnel" title="Aucune notion ne correspond" text="Essayez un autre mot, ou retirez le filtre de couche.">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
        </McEmptyState>
      </main>
    </div>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-def { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-def-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-def-wrap { max-width: 1120px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; }
.mc-scr-def-main { display: grid; gap: 16px; }
.mc-scr-def-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-def-titles { flex: 1; min-width: 220px; }
.mc-scr-def-titles .mc-over { margin: 0 0 2px; }
.mc-scr-def-titles h1 { margin: 0; }
.mc-scr-def-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-def-lede { margin: 4px 0 0; font-size: 14px; line-height: 20px; color: var(--ink-muted); }
.mc-scr-def-search { width: 300px; }
.mc-scr-def-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-def-grow { flex: 1; }
.mc-scr-def-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-def-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-def-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-def-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-def-pill { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 10px; border-radius: var(--radius-pill); background: var(--surface-sunken); font: 600 12px/16px var(--font-sans); color: var(--ink); }
.mc-scr-def-chip:hover:not([disabled]) .mc-scr-def-pill { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-def-pill i { width: 8px; height: 8px; border-radius: 2px; background: var(--ink-subtle); }
.mc-scr-def-pill.l-metier i { background: var(--layer-metier); }
.mc-scr-def-pill.l-fonctionnel i { background: var(--layer-fonctionnel); }
.mc-scr-def-pill.l-applicatif i { background: var(--layer-applicatif); }
.mc-scr-def-pill.l-technique i { background: var(--layer-technique); }
.mc-scr-def-alpha { display: flex; gap: 2px; flex-wrap: wrap; }
.mc-scr-def-alpha button, .mc-scr-def-alpha span { width: 24px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font: 600 12px/1 var(--font-display); box-sizing: border-box; }
.mc-scr-def-alpha button { border: 0; padding: 0; background: transparent; color: var(--ink); cursor: pointer; }
.mc-scr-def-alpha button:hover { background: var(--surface-sunken); }
.mc-scr-def-alpha button.is-on { background: var(--navy); color: var(--on-navy); }
.mc-scr-def-alpha button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-def-alpha span { color: var(--line-strong); }

.mc-scr-def-list { display: grid; gap: 20px; }
.mc-scr-def-group { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 12px; align-items: start; }
.mc-scr-def-letter { margin: 6px 0 0; font: 700 22px/28px var(--font-display); color: var(--ink-subtle); }
.mc-scr-def-items { margin: 0; padding: 0; list-style: none; display: grid; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-def-item { display: grid; grid-template-columns: 32px minmax(140px, 200px) minmax(0, 1fr) auto; gap: 4px 14px; align-items: start; padding: 14px 16px; border-top: 1px solid var(--line); }
.mc-scr-def-item:first-child { border-top: 0; }
.mc-scr-def-tile { width: 32px; height: 32px; border-radius: var(--radius-sm); display: inline-flex; align-items: center; justify-content: center; background: var(--surface-sunken); color: var(--ink-muted); }
.mc-scr-def-tile.l-metier { background: var(--layer-metier-soft); color: var(--layer-metier); }
.mc-scr-def-tile.l-fonctionnel { background: var(--layer-fonctionnel-soft); color: var(--layer-fonctionnel); }
.mc-scr-def-tile.l-applicatif { background: var(--layer-applicatif-soft); color: var(--layer-applicatif); }
.mc-scr-def-tile.l-technique { background: var(--layer-technique-soft); color: var(--layer-technique); }
.mc-scr-def-term { margin: 0; padding-top: 6px; font: 600 15px/20px var(--font-display); }
.mc-scr-def-alias { display: block; font: 400 12px/16px var(--font-sans); color: var(--ink-subtle); }
.mc-scr-def-text { margin: 0; padding-top: 6px; font-size: 14px; line-height: 20px; color: var(--ink); }
.mc-scr-def-ex { display: block; margin-top: 2px; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-def-see { margin: 0; padding-top: 6px; }
.mc-scr-def-see a { display: inline-flex; align-items: center; gap: 4px; font: 600 13px/18px var(--font-sans); color: var(--accent); text-decoration: none; white-space: nowrap; }
.mc-scr-def-see a:hover { text-decoration: underline; }
.mc-scr-def-see a:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: var(--radius-xs); }
@media (min-width: 1800px) {
  .mc-scr-def-wrap { max-width: 1280px; padding-inline: 40px; }
  .mc-scr-def-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1180px) {
  .mc-scr-def-wrap { padding-inline: 24px; }
  .mc-scr-def-search { flex: 1 1 220px; width: auto; }
  .mc-scr-def-item { grid-template-columns: 32px minmax(0, 1fr) auto; }
  .mc-scr-def-text { grid-column: 2 / -1; padding-top: 0; }
  .mc-scr-def-see { grid-column: 3; grid-row: 1; }
}
</style>
