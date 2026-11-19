<script setup lang="ts">
// Écran « Tableaux de bord » : la liste des tableaux enregistrés, en cartes avec une vignette.
// « Santé du SI » ouvre l'écran Tableau de bord ; les autres l'ouvrent sous leur nom (/tableau-de-bord?nom=…).
// « Nouveau tableau de bord » : modale (nom, modèle, partage) qui ajoute la carte.
import { computed, ref } from 'vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McModal from '../../components/McModal/McModal.vue'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goPath, inApp, pathHref } from '../bridge'
import { GABARITS, tableauxDeBord, type Gabarit, type TableauDeBord } from '../../data/tableaux'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const MOI = 'Théo Naulet'

/* ---------- Tableaux (en mémoire) ---------- */
const tableaux = ref<TableauDeBord[]>(tableauxDeBord.map((t) => ({ ...t })))
const view = ref('tous')
const query = ref('')
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return tableaux.value
    .filter((t) => (view.value === 'mes' ? t.proprietaire === MOI : view.value === 'partages' ? t.partage : view.value === 'favoris' ? t.favori : true))
    .filter((t) => !q || norm(`${t.name} ${t.description} ${t.proprietaire}`).includes(q))
    .sort((a, b) => Number(b.favori) - Number(a.favori))
})
const views = computed(() => [
  { value: 'tous', label: `Tous · ${tableaux.value.length}` },
  { value: 'mes', label: `Les miens · ${tableaux.value.filter((t) => t.proprietaire === MOI).length}` },
  { value: 'partages', label: `Partagés · ${tableaux.value.filter((t) => t.partage).length}` },
  { value: 'favoris', label: `Favoris · ${tableaux.value.filter((t) => t.favori).length}` },
])
const searchCount = computed(() => (query.value.trim() ? (filtered.value.length ? plural(filtered.value.length, 'tableau', 'tableaux') : 'Aucun tableau') : undefined))

/** Adresse d'un tableau : « Santé du SI » est l'écran Tableau de bord ; les autres s'y ouvrent sous leur nom. */
const pathOf = (t: TableauDeBord) => (t.id === 'sante' ? '/tableau-de-bord' : `/tableau-de-bord?nom=${encodeURIComponent(t.id)}`)
/** Dans Storybook, les paramètres d'adresse ne sont pas transmis : l'écran s'ouvre seul. */
const target = (p: string) => (inApp() ? p : p.split('?')[0])
function open(e: MouseEvent | null, t: TableauDeBord) {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey)) return
  e?.preventDefault()
  goPath(target(pathOf(t)))
}
function toggleFav(t: TableauDeBord) {
  t.favori = !t.favori
  toast.success(t.favori ? `« ${t.name} » ajouté aux favoris` : `« ${t.name} » retiré des favoris`)
}

/* ---------- Nouveau tableau ---------- */
const newOpen = ref(false)
const fName = ref<string | number>('')
const fGabarit = ref<McSelectValue | null>('vide')
const fPartage = ref(false)
const tried = ref(false)
const gabaritOptions = (Object.keys(GABARITS) as Gabarit[]).map((g) => ({ value: g, label: GABARITS[g].label }))
const nameError = computed(() => {
  if (!tried.value) return undefined
  const v = String(fName.value ?? '').trim()
  if (!v) return 'Donnez un nom au tableau de bord.'
  if (tableaux.value.some((t) => norm(t.name) === norm(v))) return 'Un tableau de bord porte déjà ce nom : choisissez-en un autre.'
  return undefined
})
const gabaritHelp = computed(() => {
  const g = GABARITS[(fGabarit.value as Gabarit) ?? 'vide']
  return g.widgets ? `${g.description} ${plural(g.widgets, 'widget', 'widgets')} au départ.` : g.description
})
function openNew() {
  fName.value = ''
  fGabarit.value = 'vide'
  fPartage.value = false
  tried.value = false
  newOpen.value = true
}
function slug(s: string) {
  return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tableau'
}
function confirmNew() {
  tried.value = true
  if (nameError.value) return
  const name = String(fName.value).trim()
  const gabarit = (fGabarit.value as Gabarit) ?? 'vide'
  let id = slug(name)
  while (tableaux.value.some((t) => t.id === id)) id += '-2'
  const today = new Date()
  const t: TableauDeBord = {
    id,
    name,
    description: gabarit === 'vide' ? 'Tableau vide : ajoutez vos widgets.' : `Créé à partir du modèle « ${GABARITS[gabarit].label} ».`,
    gabarit,
    proprietaire: MOI,
    partage: fPartage.value,
    favori: false,
    modifie: today.toLocaleDateString('fr-FR'),
  }
  tableaux.value.push(t)
  newOpen.value = false
  query.value = ''
  if (view.value === 'favoris' || (view.value === 'partages' && !t.partage)) view.value = 'tous'
  toast.success(`Tableau de bord créé : ${name}`, { actionLabel: 'Ouvrir', onAction: () => open(null, t) })
}
</script>

<template>
  <div class="mc-scr-tdb">
    <AdminNav active="Tableaux de bord" />

    <main class="mc-scr-tdb-main">
      <header class="mc-scr-tdb-head">
        <div class="mc-scr-tdb-titles">
          <p class="mc-over">Pilotage</p>
          <h1 class="title-lg">Tableaux de bord <span class="mc-scr-tdb-n">{{ tableaux.length }}</span></h1>
        </div>
        <McSearchField v-model="query" class="mc-scr-tdb-search" placeholder="Rechercher un tableau de bord" :count="searchCount" />
        <McButton icon="plus" @click="openNew">Nouveau tableau de bord</McButton>
      </header>

      <McToggleGroup v-model="view" class="mc-scr-tdb-views" label="Afficher" :options="views" />

      <div v-if="filtered.length" class="mc-scr-tdb-grid">
        <article v-for="t in filtered" :key="t.id" class="mc-scr-tdb-card">
          <a class="mc-scr-tdb-open" :href="pathHref(target(pathOf(t)))" :aria-label="`Ouvrir ${t.name}`" @click="open($event, t)">
            <svg class="mc-scr-tdb-thumb" viewBox="0 0 240 120" aria-hidden="true" focusable="false">
              <rect class="bg" x="0" y="0" width="240" height="120" />
              <template v-if="t.gabarit === 'sante'">
                <rect v-for="i in 4" :key="`k${i}`" class="tile" :x="10 + (i - 1) * 56" y="10" width="50" height="28" rx="4" />
                <rect class="crit" x="16" y="17" width="16" height="6" rx="2" />
                <rect class="warn" x="72" y="17" width="16" height="6" rx="2" />
                <rect class="warn" x="128" y="17" width="16" height="6" rx="2" />
                <rect class="warn" x="184" y="17" width="16" height="6" rx="2" />
                <rect class="tile" x="10" y="46" width="128" height="64" rx="4" />
                <rect v-for="(h, i) in [22, 34, 18, 40, 28, 46]" :key="`b${i}`" class="bar" :x="20 + i * 19" :y="102 - h" width="10" :height="h" rx="2" />
                <rect class="tile" x="146" y="46" width="84" height="64" rx="4" />
                <rect v-for="(w, i) in [60, 48, 40, 30]" :key="`r${i}`" class="line" x="154" :y="56 + i * 13" :width="w" height="6" rx="3" />
              </template>
              <template v-else-if="t.gabarit === 'controles'">
                <template v-for="row in 2" :key="`row${row}`">
                  <rect v-for="i in 4" :key="`c${row}-${i}`" class="tile" :x="10 + (i - 1) * 56" :y="10 + (row - 1) * 52" width="50" height="46" rx="4" />
                  <rect v-for="i in 4" :key="`n${row}-${i}`" :class="(i + row) % 3 === 0 ? 'crit' : (i + row) % 3 === 1 ? 'warn' : 'ok'" :x="16 + (i - 1) * 56" :y="18 + (row - 1) * 52" width="14" height="6" rx="2" />
                  <rect v-for="i in 4" :key="`v${row}-${i}`" class="num" :x="16 + (i - 1) * 56" :y="30 + (row - 1) * 52" width="22" height="12" rx="2" />
                </template>
              </template>
              <template v-else-if="t.gabarit === 'obsolescence'">
                <rect class="tile" x="10" y="10" width="220" height="50" rx="4" />
                <g v-for="(seg, i) in [[40, 60, 100], [70, 50, 80], [20, 90, 90]]" :key="`s${i}`">
                  <rect class="crit" x="20" :y="18 + i * 13" :width="seg[0]" height="8" rx="2" />
                  <rect class="warn" :x="20 + seg[0]" :y="18 + i * 13" :width="seg[1]" height="8" />
                  <rect class="ok" :x="20 + seg[0] + seg[1]" :y="18 + i * 13" :width="seg[2]" height="8" rx="2" />
                </g>
                <rect class="tile" x="10" y="66" width="220" height="44" rx="4" />
                <rect v-for="(w, i) in [150, 120, 90]" :key="`o${i}`" class="line" x="20" :y="74 + i * 11" :width="w" height="6" rx="3" />
              </template>
              <template v-else-if="t.gabarit === 'contrats'">
                <rect class="tile" x="10" y="10" width="220" height="44" rx="4" />
                <line class="axis" x1="20" y1="32" x2="220" y2="32" />
                <circle v-for="(x, i) in [36, 70, 118, 160, 204]" :key="`d${i}`" :class="i < 2 ? 'crit' : i < 3 ? 'warn' : 'ok'" :cx="x" cy="32" r="5" />
                <rect class="tile" x="10" y="60" width="108" height="50" rx="4" />
                <rect v-for="(h, i) in [30, 20, 36, 14]" :key="`cb${i}`" class="bar" :x="22 + i * 24" :y="102 - h" width="14" :height="h" rx="2" />
                <rect class="tile" x="124" y="60" width="106" height="50" rx="4" />
                <rect class="num" x="134" y="70" width="44" height="16" rx="2" />
                <rect class="line" x="134" y="94" width="70" height="6" rx="3" />
              </template>
              <template v-else>
                <rect class="empty" x="20" y="16" width="200" height="88" rx="6" />
                <path class="plus" d="M120 50v20M110 60h20" />
              </template>
            </svg>
            <span class="mc-scr-tdb-name">{{ t.name }}</span>
            <span class="mc-scr-tdb-desc">{{ t.description }}</span>
          </a>
          <McIconButton
            class="mc-scr-tdb-star"
            :class="{ 'is-fav': t.favori }"
            size="sm"
            icon="star"
            :variant="t.favori ? 'pressed' : 'default'"
            :label="t.favori ? `Retirer ${t.name} des favoris` : `Ajouter ${t.name} aux favoris`"
            @click="toggleFav(t)"
          />
          <footer class="mc-scr-tdb-foot">
            <span class="mc-scr-tdb-who"><McAvatar :name="t.proprietaire" role="Propriétaire" />{{ t.proprietaire === MOI ? 'Vous' : t.proprietaire }}</span>
            <McStatusChip size="sm">{{ t.partage ? 'Partagé' : 'Privé' }}</McStatusChip>
            <span class="mc-scr-tdb-date">Modifié le {{ t.modifie }}</span>
          </footer>
        </article>
        <button type="button" class="mc-scr-tdb-add" @click="openNew">
          <McIcon name="plus" size="lg" />
          <span>Nouveau tableau de bord</span>
        </button>
      </div>
      <McEmptyState v-else icon="dashboard" :title="view === 'favoris' && !query ? 'Aucun tableau de bord en favori' : 'Aucun tableau de bord ne correspond'" :text="view === 'favoris' && !query ? 'Cliquez sur l’étoile d’un tableau pour le retrouver ici.' : 'Modifiez la recherche ou affichez tous les tableaux.'">
        <template #action>
          <McButton variant="outline" size="sm" icon="x" @click="(query = ''), (view = 'tous')">Afficher tous les tableaux</McButton>
        </template>
      </McEmptyState>
    </main>

    <McModal
      v-model:open="newOpen"
      title="Nouveau tableau de bord"
      :type="{ label: 'Tableau de bord', icon: 'dashboard', layer: 'applicatif' }"
      confirm-label="Créer"
      confirm-icon="plus"
      :dirty="!!String(fName ?? '').trim()"
      @confirm="confirmNew"
    >
      <div class="mc-scr-tdb-form">
        <McTextField v-model="fName" label="Nom" required placeholder="ex. Applications de Scolarité" :error="nameError" />
        <McSelect v-model="fGabarit" label="Modèle" :options="gabaritOptions" :help="gabaritHelp" />
        <McSwitch v-model="fPartage" label="Partager avec toute l’équipe" help="Sinon, vous seul le voyez." block />
      </div>
    </McModal>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-tdb { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-tdb-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px 40px; display: grid; gap: 18px; align-content: start; }
.mc-scr-tdb-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-tdb-titles { flex: 1; min-width: 200px; }
.mc-scr-tdb-titles .mc-over { margin: 0 0 2px; }
.mc-scr-tdb-titles h1 { margin: 0; }
.mc-scr-tdb-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-tdb-search { width: 280px; }
.mc-scr-tdb-views { justify-self: start; }
.mc-scr-tdb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.mc-scr-tdb-card { position: relative; display: grid; grid-template-rows: 1fr auto; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-node); overflow: hidden; transition: box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out); }
.mc-scr-tdb-card:hover { box-shadow: var(--shadow-hover); border-color: var(--line-strong); }
.mc-scr-tdb-open { display: grid; gap: 4px; align-content: start; padding: 0 0 12px; color: inherit; text-decoration: none; }
.mc-scr-tdb-open:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; border-radius: var(--radius-md); }
.mc-scr-tdb-thumb { display: block; width: 100%; height: auto; aspect-ratio: 2 / 1; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
.mc-scr-tdb-thumb .bg { fill: var(--surface-sunken); }
.mc-scr-tdb-thumb .tile { fill: var(--surface); stroke: var(--line); }
.mc-scr-tdb-thumb .crit { fill: var(--status-critical); }
.mc-scr-tdb-thumb .warn { fill: var(--status-warn); }
.mc-scr-tdb-thumb .ok { fill: var(--status-ok); }
.mc-scr-tdb-thumb .bar { fill: var(--accent); opacity: .75; }
.mc-scr-tdb-thumb .line { fill: var(--line-strong); }
.mc-scr-tdb-thumb .num { fill: var(--ink-subtle); opacity: .5; }
.mc-scr-tdb-thumb .axis { stroke: var(--line-strong); stroke-width: 2; }
.mc-scr-tdb-thumb .empty { fill: none; stroke: var(--line-strong); stroke-dasharray: 5 4; stroke-width: 1.5; }
.mc-scr-tdb-thumb .plus { stroke: var(--ink-subtle); stroke-width: 3; stroke-linecap: round; }
.mc-scr-tdb-name { padding: 0 14px; font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-scr-tdb-open:hover .mc-scr-tdb-name { color: var(--accent); }
.mc-scr-tdb-desc { padding: 0 14px; font-size: 13px; line-height: 18px; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mc-scr-tdb-star { position: absolute; top: 8px; right: 8px; background: var(--surface); box-shadow: var(--shadow-node); }
.mc-scr-tdb-star.is-fav { color: var(--data-2); }
.mc-scr-tdb-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 14px; border-top: 1px solid var(--line); font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-tdb-who { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.mc-scr-tdb-date { margin-left: auto; color: var(--ink-subtle); white-space: nowrap; }
.mc-scr-tdb-add { display: grid; place-content: center; justify-items: center; gap: 8px; min-height: 220px; border: 1px dashed var(--line-strong); border-radius: var(--radius-md); background: transparent; color: var(--ink-muted); font: 600 14px/20px var(--font-sans); cursor: pointer; }
.mc-scr-tdb-add:hover { background: var(--surface); color: var(--accent); border-color: var(--accent); }
.mc-scr-tdb-add:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
/* Les listes déroulantes du formulaire débordent de la modale au lieu d'être coupées. */
.mc-scr-tdb-form { display: grid; gap: 16px; }
@media (min-width: 1800px) {
  .mc-scr-tdb-main { padding-inline: 40px; }
  .mc-scr-tdb-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
}
@media (max-width: 1180px) {
  .mc-scr-tdb-search { flex: 1 1 220px; width: auto; }
}
</style>
