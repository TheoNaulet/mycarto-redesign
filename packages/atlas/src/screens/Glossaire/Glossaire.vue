<script setup lang="ts">
// Écran « Glossaire des applications » : une tuile par lettre (0123 pour les chiffres) avec le nombre d'applications,
// les lettres vides grisées. Clic sur une lettre : ses applications, chacune vers sa fiche.
import { appLogo } from '../../logos/appLogo'
import { computed, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McNode from '../../components/McNode/McNode.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { applications, getApplication, type Application } from '../../data/applications'
import { exportCsv } from '../../data/a-texte'
import AppInspector from '../shared/AppInspector.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const DIGITS = '0123'
const LETTERS = [DIGITS, ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]
const keyOf = (name: string) => {
  const c = norm(name).charAt(0).toUpperCase()
  return /[0-9]/.test(c) ? DIGITS : c
}
const byName = (a: Application, b: Application) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })

/* ---------- Recherche et lettres ---------- */
const query = ref('')
const found = computed(() => {
  const q = norm(query.value.trim())
  return q ? applications.filter((a) => norm(`${a.name} ${a.aliases.join(' ')} ${a.description ?? ''}`).includes(q)) : applications
})
const counts = computed(() => {
  const c: Record<string, number> = Object.fromEntries(LETTERS.map((l) => [l, 0]))
  for (const a of found.value) {
    const k = keyOf(a.name)
    if (k in c) c[k]++
  }
  return c
})
const firstLetter = () => LETTERS.find((l) => counts.value[l]) ?? null
const letter = ref<string | null>(firstLetter())
watch(counts, () => {
  if (!letter.value || !counts.value[letter.value]) letter.value = firstLetter()
})
const list = computed(() => (letter.value ? found.value.filter((a) => keyOf(a.name) === letter.value).sort(byName) : []))
const results = ref<HTMLElement>()
function pick(l: string) {
  letter.value = l
  const top = results.value?.getBoundingClientRect().top ?? 0
  if (top > window.innerHeight - 120) results.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
const subOf = (a: Application) => a.description ?? (a.parent ? `Module de ${a.parent}` : a.domaines[0]) ?? a.fournisseur ?? 'Fiche à compléter'
const letterLabel = (l: string) => (l === DIGITS ? 'un chiffre' : `la lettre ${l}`)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Glossaire' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (found.value.length ? plural(found.value.length, 'application', 'applications') : 'Aucun résultat') : undefined))
/** Exporter : les applications trouvées (toutes, ou celles de la recherche), rangées par lettre. */
function exportList() {
  const list = [...found.value].sort(byName)
  const rows = list.map((a) => [keyOf(a.name), a.name, a.nature ?? '', a.aliases.join(', '), a.description ?? '', a.domaines.join(', '), a.fournisseur ?? ''])
  const file = exportCsv(query.value.trim() ? `Glossaire ${query.value.trim()}` : 'Glossaire des applications', ['Lettre', 'Application', 'Nature', 'Autres noms', 'Description', 'Domaines', 'Fournisseur'], rows)
  toast.success(`${file} téléchargé : ${plural(rows.length, 'application', 'applications')}`)
}
// Clic : l'application s'affiche dans l'inspecteur à droite ; double-clic ou ⌘/Ctrl-clic : sa fiche.
function open(a: Application, e?: MouseEvent) {
  if (e && (e.metaKey || e.ctrlKey)) return void window.open(ficheHref(a.slug), '_blank')
  inspectedSlug.value = inspectedSlug.value === a.slug ? null : a.slug
}
const inspectedSlug = ref<string | null>(null)
const inspected = computed(() => getApplication(inspectedSlug.value))
/** Sans sélection, l'inspecteur résume ce que montre la liste. */
const summary = computed<KeyValueItem[]>(() => [{ key: 'Applications', value: found.value.filter((a) => a.nature !== 'Module applicatif').length }, { key: 'Modules applicatifs', value: found.value.filter((a) => a.nature === 'Module applicatif').length }, { key: 'Infra obsolète', value: found.value.filter((a) => a.obsolescence?.status === 'critical').length }, { key: 'Sans description', value: found.value.filter((a) => !a.description).length }])

</script>

<template>
  <div class="mc-scr-glos">
    <McAppBar class="mc-scr-glos-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-glos-wrap">
    <main class="mc-scr-glos-main">
      <header class="mc-scr-glos-head">
        <div class="mc-scr-glos-titles">
          <p class="mc-over">Couche applicative</p>
          <h1 class="title-lg">Glossaire des applications <span class="mc-scr-glos-n">{{ found.length }}</span></h1>
        </div>
        <McSearchField v-model="query" class="mc-scr-glos-search" placeholder="Rechercher une application" :count="searchCount" />
      </header>

      <nav class="mc-scr-glos-tiles" aria-label="Lettres du glossaire">
        <button
          v-for="l in LETTERS"
          :key="l"
          type="button"
          class="mc-scr-glos-tile"
          :class="{ 'is-on': letter === l, 'is-digits': l === DIGITS }"
          :disabled="!counts[l]"
          :aria-pressed="letter === l"
          :aria-label="counts[l] ? `${plural(counts[l], 'application commence', 'applications commencent')} par ${letterLabel(l)}` : `Aucune application ne commence par ${letterLabel(l)}`"
          @click="pick(l)"
        >
          <span class="mc-scr-glos-l">{{ l }}</span>
          <span class="mc-scr-glos-c" aria-hidden="true">{{ counts[l] || '–' }}</span>
        </button>
      </nav>

      <section ref="results" class="mc-scr-glos-list" :aria-label="letter ? `Applications en ${letter}` : 'Applications'">
        <template v-if="letter && list.length">
          <h2 class="mc-scr-glos-h2">
            <span class="mc-scr-glos-big">{{ letter }}</span>
            <span class="mc-scr-glos-count">{{ plural(list.length, 'application', 'applications') }}</span>
          </h2>
          <div class="mc-scr-glos-grid">
            <McNode
              v-for="a in list"
              :key="a.slug"
              layer="applicatif"
              icon="app"
              :logo="appLogo(a.name)"
              :type="a.nature === 'Module applicatif' ? 'Module' : 'Application'"
              :name="a.name"
              :subtitle="subOf(a)"
              :status="a.obsolescence?.status === 'critical' ? 'critical' : undefined"
              :title="`${a.name} : double-clic pour ouvrir la fiche`"
              :selected="inspectedSlug === a.slug"
              @select="open(a, $event)"
              @open="goFiche(a.slug)"
            />
          </div>
        </template>
        <McEmptyState v-else icon="search" title="Aucune application ne correspond" text="Modifiez la recherche.">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton></template>
        </McEmptyState>
      </section>
    </main>
    <AppInspector :app="inspected" :summary="summary" @close="inspectedSlug = null" @inspect="(a) => (inspectedSlug = a.slug)" />
    </div>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-glos { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-glos-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-glos-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-glos-main { flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
.mc-scr-glos-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-glos-titles { flex: 1; min-width: 180px; }
.mc-scr-glos-titles .mc-over { margin: 0 0 2px; }
.mc-scr-glos-titles h1 { margin: 0; }
.mc-scr-glos-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-glos-search { width: 300px; }
/* 10 à 12 tuiles par ligne à 1024, 14 et plus au-delà : 2 ou 3 lignes. */
.mc-scr-glos-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; }
.mc-scr-glos-tile { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: inherit; text-align: left; cursor: pointer; box-shadow: var(--shadow-node); transition: border-color .12s, box-shadow .12s; }
.mc-scr-glos-tile:hover:not([disabled]) { border-color: var(--line-strong); box-shadow: var(--shadow-hover); }
.mc-scr-glos-tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-glos-tile.is-on { background: var(--navy); border-color: var(--navy); color: var(--on-navy); }
.mc-scr-glos-tile.is-on .mc-scr-glos-c { color: var(--on-navy-muted); }
.mc-scr-glos-tile[disabled] { background: transparent; box-shadow: none; border-style: dashed; color: var(--line-strong); cursor: not-allowed; }
.mc-scr-glos-tile[disabled] .mc-scr-glos-c { color: var(--line-strong); }
.mc-scr-glos-l { font: 700 22px/26px var(--font-display); }
.mc-scr-glos-tile.is-digits .mc-scr-glos-l { font-size: 18px; letter-spacing: .02em; }
.mc-scr-glos-c { font: 600 13px/16px var(--font-sans); color: var(--ink-subtle); font-variant-numeric: tabular-nums; }
.mc-scr-glos-list { display: grid; gap: 4px; scroll-margin-top: 96px; }
.mc-scr-glos-h2 { display: flex; align-items: baseline; gap: 10px; margin: 0; font: inherit; }
.mc-scr-glos-big { font: 700 28px/32px var(--font-display); }
.mc-scr-glos-count { font-size: 13px; color: var(--ink-subtle); }
.mc-scr-glos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px 14px; }
.mc-scr-glos-grid > .mc-node { width: auto; min-width: 0; }
@media (min-width: 1800px) {
}
@media (max-width: 1280px) {
}
</style>
