<script setup lang="ts">
// Écran « Modèles de carte » : la liste des modèles, en cartes avec une vignette, dans l'administration.
// Ouvrir un modèle mène à l'éditeur (plein écran), dont le retour ramène ici.
import { computed, ref } from 'vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McButton from '../../components/McButton/McButton.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goPath, inApp, pathHref } from '../bridge'
import { frDate } from '../../data/corbeille'
import { modelesCarte, type ModeleCarte } from '../../data/modelesCarte'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const MOI = 'Théo Naulet'

const query = ref('')
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return modelesCarte.filter((m) => !q || norm(`${m.name} ${m.description} ${m.types.map((t) => t.label).join(' ')}`).includes(q))
})
const searchCount = computed(() => (query.value.trim() ? (filtered.value.length ? plural(filtered.value.length, 'modèle', 'modèles') : 'Aucun modèle') : undefined))

/** Seul « Applis et flux d'un domaine » est dessiné dans l'éditeur de la démonstration. */
const EDITABLE = 'applis-flux'
const editorPath = inApp() ? '/editeur?depuis=modeles' : '/editeur'
function open(e: MouseEvent, m: ModeleCarte) {
  if (m.id === EDITABLE) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    return goPath(editorPath)
  }
  e.preventDefault()
  toast.info(`Le modèle « ${m.name} » n’est pas encore dessiné dans cette démonstration.`)
}
</script>

<template>
  <div class="mc-scr-mdc">
    <AdminNav active="Modèles de carte" />

    <main class="mc-scr-mdc-main">
      <header class="mc-scr-mdc-head">
        <div class="mc-scr-mdc-titles">
          <p class="mc-over">Modélisation</p>
          <h1 class="title-lg">Modèles de carte <span class="mc-scr-mdc-n">{{ modelesCarte.length }}</span></h1>
          <p class="mc-cap">Chaque carte part d’un modèle : les types d’objets qu’elle montre et leur disposition.</p>
        </div>
        <McSearchField v-model="query" class="mc-scr-mdc-search" placeholder="Rechercher un modèle" :count="searchCount" />
      </header>

      <div v-if="filtered.length" class="mc-scr-mdc-grid">
        <article v-for="m in filtered" :key="m.id" class="mc-scr-mdc-card">
          <a class="mc-scr-mdc-open" :href="m.id === EDITABLE ? pathHref(editorPath) : '#'" :aria-label="`Ouvrir le modèle ${m.name}`" @click="open($event, m)">
            <svg class="mc-scr-mdc-thumb" viewBox="0 0 240 120" aria-hidden="true" focusable="false">
              <rect class="bg" x="0" y="0" width="240" height="120" />
              <template v-if="m.disposition === 'domaine'">
                <rect class="zone" x="70" y="14" width="100" height="92" rx="6" />
                <rect v-for="(y, i) in [26, 52, 78]" :key="`a${i}`" class="app" x="84" :y="y" width="72" height="16" rx="3" />
                <rect class="ext" x="14" y="44" width="40" height="16" rx="8" />
                <rect class="ext" x="186" y="64" width="40" height="16" rx="8" />
                <path class="link" d="M54 52H84M156 34c20 0 20 38 30 38M156 86h30" />
              </template>
              <template v-else-if="m.disposition === 'infra'">
                <rect class="app" x="84" y="12" width="72" height="18" rx="3" />
                <rect v-for="(x, i) in [36, 104, 172]" :key="`c${i}`" class="tile" :x="x" y="46" width="44" height="16" rx="3" />
                <rect v-for="(x, i) in [36, 104, 172]" :key="`m${i}`" class="tech" :x="x" y="82" width="44" height="22" rx="3" />
                <path class="link" d="M120 30v16M120 30L58 46M120 30l74 16M58 62v20M126 62v20M194 62v20" />
              </template>
              <template v-else-if="m.disposition === 'processus'">
                <rect class="metier" x="14" y="12" width="212" height="22" rx="4" />
                <rect v-for="(x, i) in [14, 124]" :key="`r${i}`" class="zone" :x="x" y="42" width="102" height="34" rx="4" />
                <rect class="metier" x="14" y="84" width="212" height="24" rx="4" />
                <rect v-for="(x, i) in [22, 62, 132, 172]" :key="`p${i}`" class="tile" :x="x" y="52" width="34" height="14" rx="3" />
              </template>
              <template v-else-if="m.disposition === 'organigramme'">
                <rect class="metier" x="96" y="12" width="48" height="18" rx="4" />
                <rect v-for="(x, i) in [30, 96, 162]" :key="`s${i}`" class="tile" :x="x" y="50" width="48" height="18" rx="4" />
                <rect v-for="(x, i) in [36, 102, 168]" :key="`ap${i}`" class="app" :x="x" y="86" width="36" height="14" rx="3" />
                <path class="link" d="M120 30v10H54v10M120 40v10M120 40h66v10M54 68v18M120 68v18M186 68v18" />
              </template>
              <template v-else>
                <rect v-for="(x, i) in [14, 124]" :key="`z${i}`" class="zone" :x="x" y="14" width="102" height="92" rx="6" />
                <template v-for="(x, i) in [24, 134]" :key="`g${i}`">
                  <rect v-for="j in 3" :key="`t${i}-${j}`" class="tech" :x="x" :y="28 + (j - 1) * 24" width="82" height="16" rx="3" />
                </template>
              </template>
            </svg>
            <span class="mc-scr-mdc-name">{{ m.name }}</span>
            <span class="mc-scr-mdc-desc">{{ m.description }}</span>
            <span class="mc-scr-mdc-types">
              <McTypeChip v-for="t in m.types" :key="t.label" :type="t.label" :layer="t.layer" :icon="t.icon" size="sm" />
            </span>
          </a>
          <footer class="mc-scr-mdc-foot">
            <span class="mc-scr-mdc-who"><McAvatar :name="m.auteur" role="Auteur" />{{ m.auteur === MOI ? 'Vous' : m.auteur }}</span>
            <span>{{ plural(m.cartes, 'carte', 'cartes') }}</span>
            <span class="mc-scr-mdc-date">Modifié le {{ frDate(m.modifie) }}</span>
          </footer>
        </article>
      </div>
      <McEmptyState v-else icon="map" title="Aucun modèle ne correspond" text="Modifiez la recherche.">
        <template #action>
          <McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton>
        </template>
      </McEmptyState>
    </main>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-mdc { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-mdc-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px 40px; display: grid; gap: 18px; align-content: start; }
.mc-scr-mdc-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-mdc-titles { flex: 1; min-width: 240px; }
.mc-scr-mdc-titles .mc-over { margin: 0 0 2px; }
.mc-scr-mdc-titles h1 { margin: 0; }
.mc-scr-mdc-titles .mc-cap { margin: 4px 0 0; }
.mc-scr-mdc-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-mdc-search { width: 280px; }
.mc-scr-mdc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.mc-scr-mdc-card { display: grid; grid-template-rows: 1fr auto; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-node); overflow: hidden; transition: box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out); }
.mc-scr-mdc-card:hover { box-shadow: var(--shadow-hover); border-color: var(--line-strong); }
.mc-scr-mdc-open { display: grid; gap: 4px; align-content: start; padding: 0 0 12px; color: inherit; text-decoration: none; }
.mc-scr-mdc-open:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; border-radius: var(--radius-md); }
.mc-scr-mdc-thumb { display: block; width: 100%; height: auto; aspect-ratio: 2 / 1; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
.mc-scr-mdc-thumb .bg { fill: var(--surface-sunken); }
.mc-scr-mdc-thumb .tile { fill: var(--surface); stroke: var(--line-strong); }
.mc-scr-mdc-thumb .zone { fill: none; stroke: var(--line-strong); stroke-dasharray: 4 3; }
.mc-scr-mdc-thumb .app { fill: var(--layer-applicatif-soft, var(--accent-soft)); stroke: var(--layer-applicatif, var(--accent)); }
.mc-scr-mdc-thumb .tech { fill: var(--layer-technique-soft, var(--surface)); stroke: var(--layer-technique, var(--line-strong)); }
.mc-scr-mdc-thumb .metier { fill: var(--layer-metier-soft, var(--surface)); stroke: var(--layer-metier, var(--line-strong)); }
.mc-scr-mdc-thumb .ext { fill: var(--surface); stroke: var(--line-strong); }
.mc-scr-mdc-thumb .link { fill: none; stroke: var(--ink-subtle); stroke-width: 1.25; }
.mc-scr-mdc-name { padding: 0 14px; font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-scr-mdc-open:hover .mc-scr-mdc-name { color: var(--accent); }
.mc-scr-mdc-desc { padding: 0 14px; font-size: 13px; line-height: 18px; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mc-scr-mdc-types { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 14px 0; }
.mc-scr-mdc-foot { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px; border-top: 1px solid var(--line); font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-mdc-who { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.mc-scr-mdc-date { margin-left: auto; color: var(--ink-subtle); white-space: nowrap; }
@media (min-width: 1800px) {
  .mc-scr-mdc-main { padding-inline: 40px; }
  .mc-scr-mdc-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
}
@media (max-width: 1180px) {
  .mc-scr-mdc-search { flex: 1 1 220px; width: auto; }
}
</style>
