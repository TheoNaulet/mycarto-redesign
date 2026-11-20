<script setup lang="ts">
// Écran « Projets » (couche applicative) : le portefeuille en colonnes par état (À l'étude, En cours, Terminé).
// Cartes avec dates, responsable, avancement et applications concernées ; inspecteur pour changer l'état ;
// « Nouveau projet » ajoute une carte dans « À l'étude ».
import { computed, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McModal from '../../components/McModal/McModal.vue'
import McInspector from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { applications, hasApplication } from '../../data/applications'
import { personnes } from '../../data/referents'
import { de } from '../../data/b-export'
import { ETATS_PROJET, LIENS_PROJET, projets as seed, type EtatProjet, type Projet } from '../../data/projets'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const toDate = (fr: string) => {
  const [d, m, y] = fr.split('/').map(Number)
  return new Date(y, m - 1, d)
}

/* ---------- Portefeuille (en mémoire) ---------- */
const projets = ref<Projet[]>(seed.map((p) => ({ ...p, applications: [...p.applications], liens: [...p.liens] })))
const ETATS: EtatProjet[] = ['etude', 'cours', 'termine']
const enRetard = (p: Projet) => p.etat !== 'termine' && toDate(p.fin) < new Date()

const query = ref('')
const responsable = ref<McSelectValue | null>(null)
const responsables = computed(() => [...new Set(projets.value.map((p) => p.responsable))].sort((a, b) => a.localeCompare(b, 'fr')).map((r) => ({ value: r, label: r })))
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return projets.value.filter(
    (p) => (!responsable.value || p.responsable === responsable.value) && (!q || norm(`${p.name} ${p.description} ${p.applications.join(' ')} ${p.responsable}`).includes(q)),
  )
})
const columns = computed(() => ETATS.map((e) => ({ etat: e, items: filtered.value.filter((p) => p.etat === e) })))
const searchCount = computed(() => (query.value.trim() ? (filtered.value.length ? plural(filtered.value.length, 'projet', 'projets') : 'Aucun projet') : undefined))
function clearAll() {
  query.value = ''
  responsable.value = null
}

const VISIBLE_APPS = 3
function openApp(e: MouseEvent, name: string) {
  e.stopPropagation()
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goFiche(name)
}
function openLink(e: MouseEvent, path: string) {
  e.stopPropagation()
  goPath(path)
}

/* ---------- Inspecteur ---------- */
const inspectedId = ref<string | null>(null)
const inspected = computed(() => projets.value.find((p) => p.id === inspectedId.value))
function inspect(id: string) {
  inspectedId.value = inspectedId.value === id ? null : id
}
const etatModel = computed<McSelectValue | null>({
  get: () => inspected.value?.etat ?? null,
  set: (v) => {
    const p = inspected.value
    if (!p || !v || v === p.etat) return
    const before = p.etat
    p.etat = v as EtatProjet
    if (p.etat === 'termine') p.avancement = undefined
    else if (p.etat === 'cours' && p.avancement === undefined) p.avancement = 0
    toast.success(`« ${p.name} » ${p.etat === 'etude' ? 'repasse à l’étude' : p.etat === 'cours' ? 'passe en cours' : 'est terminé'}`, {
      actionLabel: 'Annuler',
      onAction: () => (p.etat = before),
    })
  },
})
const etatOptions = ETATS.map((e) => ({ value: e, label: ETATS_PROJET[e].label }))
const kv = computed<KeyValueItem[]>(() => {
  const p = inspected.value
  if (!p) return []
  return [
    { key: 'Responsable', value: p.responsable },
    { key: 'Début', value: p.debut },
    { key: p.etat === 'termine' ? 'Fin' : 'Fin prévue', value: p.fin },
    ...(p.etat === 'cours' ? [{ key: 'Avancement', value: `${p.avancement ?? 0} %` }] : []),
    { key: 'Budget', value: p.budget ?? null },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const p = inspected.value
  if (!p) return []
  return [
    {
      verb: 'Applications concernées',
      items: p.applications.map((a) => {
        const app = applications.find((x) => x.name === a)
        return {
          id: a,
          name: a,
          layer: 'applicatif' as const,
          icon: 'app' as const,
          ...(app?.obsolescence?.status === 'critical' ? { status: 'critical' as const, statusLabel: app.obsolescence.label } : {}),
        }
      }),
      emptyLabel: 'Aucune application liée',
      addLabel: 'Ajouter une application',
    },
  ]
})
function openRelation(item: RelationItem) {
  if (hasApplication(item.name)) goFiche(item.name)
  // Hors de la cartographie (partenaire externe…) : la liste se filtre sur ce nom.
  else query.value = item.name
}

/* ---------- Ajout d'une application au projet ouvert ---------- */
const appOpen = ref(false)
const appPick = ref<McSelectValue | null>(null)
const appTried = ref(false)
const appPickOptions = computed(() => appOptions.filter((o) => !inspected.value?.applications.includes(String(o.value))))
const appPickError = computed(() => (appTried.value && !appPick.value ? 'Choisissez une application dans la liste.' : undefined))
function openAddApp() {
  appPick.value = null
  appTried.value = false
  appOpen.value = true
}
function confirmAddApp() {
  appTried.value = true
  const p = inspected.value
  if (!p || !appPick.value) return
  const name = String(appPick.value)
  p.applications.push(name)
  if (!p.liens.includes('impact')) p.liens.push('impact')
  appOpen.value = false
  toast.success(`${name} ajoutée au projet « ${p.name} »`, {
    actionLabel: 'Annuler',
    onAction: () => {
      p.applications = p.applications.filter((a) => a !== name)
    },
  })
}

/* ---------- Nouveau projet ---------- */
const newOpen = ref(false)
const fName = ref<string | number>('')
const fDesc = ref<string | number>('')
const fResp = ref<McSelectValue | null>(null)
const fApp = ref<McSelectValue | null>(null)
const fDebut = ref<string | number>('')
const fFin = ref<string | number>('')
const tried = ref(false)
const respOptions = personnes.map((p) => ({ value: p.name, label: p.name }))
const appOptions = applications.filter((a) => a.inventaire).map((a) => ({ value: a.name, label: a.name }))
const nameError = computed(() => {
  if (!tried.value) return undefined
  const v = String(fName.value ?? '').trim()
  if (!v) return 'Donnez un nom au projet.'
  if (projets.value.some((p) => norm(p.name) === norm(v))) return 'Un projet porte déjà ce nom : choisissez-en un autre.'
  return undefined
})
const respError = computed(() => (tried.value && !fResp.value ? 'Choisissez le responsable du projet.' : undefined))
const finError = computed(() => (tried.value && fDebut.value && fFin.value && String(fFin.value) < String(fDebut.value) ? 'La fin doit venir après le début.' : undefined))
const isoToFr = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '')
function openNew() {
  fName.value = ''
  fDesc.value = ''
  fResp.value = null
  fApp.value = null
  fDebut.value = ''
  fFin.value = ''
  tried.value = false
  newOpen.value = true
}
function confirmNew() {
  tried.value = true
  if (nameError.value || respError.value || finError.value) return
  const name = String(fName.value).trim()
  const p: Projet = {
    id: `p-${Date.now()}`,
    name,
    description: String(fDesc.value ?? '').trim() || 'Description à compléter.',
    etat: 'etude',
    responsable: String(fResp.value),
    debut: isoToFr(String(fDebut.value ?? '')) || 'À définir',
    fin: isoToFr(String(fFin.value ?? '')) || 'À définir',
    applications: fApp.value ? [String(fApp.value)] : [],
    liens: fApp.value ? ['impact'] : [],
  }
  projets.value.unshift(p)
  newOpen.value = false
  clearAll()
  inspectedId.value = p.id
  toast.success(`Projet créé : ${name}`)
}
const newDirty = computed(() => !!String(fName.value ?? '').trim() || !!String(fDesc.value ?? '').trim())

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Projets' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
const datesOf = (p: Projet) => (p.debut === 'À définir' && p.fin === 'À définir' ? 'Dates à définir' : `${p.debut} → ${p.fin}`)
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Projets', value: filtered.value.length }, ...columns.value.map((c) => ({ key: ETATS_PROJET[c.etat].label, value: c.items.length })), { key: 'En retard', value: filtered.value.filter(enRetard).length }])
</script>

<template>
  <div class="mc-scr-prj">
    <McAppBar class="mc-scr-prj-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton icon="plus" @click="openNew">Nouveau projet</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-prj-wrap">
      <main class="mc-scr-prj-main">
        <header class="mc-scr-prj-head">
          <div class="mc-scr-prj-titles">
            <p class="mc-over">Couche applicative</p>
            <h1 class="title-lg">Projets <span class="mc-scr-prj-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-prj-search" placeholder="Rechercher un projet" :count="searchCount" />
          <McSelect v-model="responsable" class="mc-scr-prj-resp" :options="responsables" placeholder="Tous les responsables" clearable aria-label="Responsable" />
        </header>

        <div v-if="filtered.length" class="mc-scr-prj-board">
          <section v-for="c in columns" :key="c.etat" class="mc-scr-prj-col" :class="`is-${c.etat}`" :aria-label="ETATS_PROJET[c.etat].label">
            <h2 class="mc-scr-prj-colh">
              <McStatusChip :status="ETATS_PROJET[c.etat].status" size="sm">{{ ETATS_PROJET[c.etat].label }}</McStatusChip>
              <span class="mc-scr-prj-count">{{ c.items.length }}</span>
            </h2>
            <p v-if="!c.items.length" class="mc-scr-prj-none">Aucun projet {{ c.etat === 'termine' ? 'terminé' : c.etat === 'cours' ? 'en cours' : 'à l’étude' }}</p>
            <article
              v-for="p in c.items"
              :key="p.id"
              class="mc-scr-prj-card"
              :class="{ 'is-on': inspectedId === p.id }"
            >
              <button type="button" class="mc-scr-prj-open" :aria-pressed="inspectedId === p.id" @click="inspect(p.id)">
                <span class="mc-scr-prj-name">{{ p.name }}</span>
                <span class="mc-scr-prj-desc">{{ p.description }}</span>
              </button>
              <div class="mc-scr-prj-meta">
                <span class="mc-scr-prj-dates"><McIcon name="calendar" size="sm" />{{ datesOf(p) }}</span>
                <McStatusChip v-if="enRetard(p)" status="critical" size="sm">En retard</McStatusChip>
              </div>
              <div v-if="p.etat === 'cours'" class="mc-scr-prj-progress" role="progressbar" :aria-valuenow="p.avancement ?? 0" aria-valuemin="0" aria-valuemax="100" :aria-label="`Avancement ${de(p.name)}`">
                <span class="tr"><i :style="{ width: `${p.avancement ?? 0}%` }" /></span>
                <span class="v">{{ p.avancement ?? 0 }} %</span>
              </div>
              <div v-if="p.applications.length" class="mc-scr-prj-apps">
                <template v-for="a in p.applications.slice(0, VISIBLE_APPS)" :key="a">
                  <a v-if="hasApplication(a)" class="mc-scr-prj-app" :href="ficheHref(a)" :title="`Ouvrir la fiche ${de(a)}`" @click="openApp($event, a)"><McIcon name="app" size="sm" />{{ a }}</a>
                  <span v-else class="mc-scr-prj-app"><McIcon name="app" size="sm" />{{ a }}</span>
                </template>
                <button v-if="p.applications.length > VISIBLE_APPS" type="button" class="mc-scr-prj-more" @click="inspect(p.id)">+{{ p.applications.length - VISIBLE_APPS }}</button>
              </div>
              <footer class="mc-scr-prj-foot">
                <span class="mc-scr-prj-who"><McAvatar :name="p.responsable" role="Responsable du projet" />{{ p.responsable }}</span>
                <span class="mc-scr-prj-links">
                  <McIconButton v-for="l in p.liens" :key="l" size="sm" :icon="LIENS_PROJET[l].icon" :label="LIENS_PROJET[l].label" @click="openLink($event, LIENS_PROJET[l].path)" />
                </span>
              </footer>
            </article>
          </section>
        </div>
        <McEmptyState v-else icon="search" layer="applicatif" title="Aucun projet ne correspond" text="Modifiez la recherche ou choisissez un autre responsable.">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
        </McEmptyState>
      </main>

      <McInspector
        :key="inspected?.id ?? 'resume'"
        class="mc-insp-dock mc-scr-prj-insp"
        :object="inspected ? { name: inspected.name, type: 'Projet', layer: 'applicatif', icon: 'project', description: inspected.description } : undefined"
        empty-title="Sélectionnez un projet"
        empty-text="Son responsable, ses dates et les applications concernées s’affichent ici."
        @close="inspectedId = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McStatusChip :status="ETATS_PROJET[inspected.etat].status" size="sm">{{ ETATS_PROJET[inspected.etat].label }}</McStatusChip>
          <McStatusChip v-if="enRetard(inspected)" status="critical" size="sm">En retard</McStatusChip>
        </template>
        <template v-if="inspected" #actions>
          <McButton v-for="l in inspected.liens" :key="l" size="sm" variant="outline" :icon="LIENS_PROJET[l].icon" @click="goPath(LIENS_PROJET[l].path)">{{ LIENS_PROJET[l].label }}</McButton>
        </template>
        <template v-if="inspected">
          <McSelect v-model="etatModel" label="État" size="sm" :options="etatOptions" />
          <McKeyValueList :items="kv" />
          <McRelationList :groups="groups" :visible="6" @open="openRelation" @add="openAddApp" />
        </template>
      </McInspector>
    </div>

    <McModal
      v-model:open="newOpen"
      title="Nouveau projet"
      :type="{ label: 'Projet', icon: 'project', layer: 'applicatif' }"
      subtitle="Le projet arrive dans la colonne « À l’étude »."
      confirm-label="Créer le projet"
      confirm-icon="plus"
      :dirty="newDirty"
      @confirm="confirmNew"
    >
      <div class="mc-scr-prj-form">
        <McTextField v-model="fName" label="Nom" required placeholder="ex. Migration de Moodle" :error="nameError" />
        <McTextField v-model="fDesc" label="Description" placeholder="ex. Passer Moodle en version 4.5 avant la rentrée" />
        <McSelect v-model="fResp" label="Responsable" required placeholder="Choisir une personne" :options="respOptions" :error="respError" />
        <McSelect v-model="fApp" label="Application concernée" placeholder="Aucune pour l’instant" :options="appOptions" clearable help="Les autres s’ajoutent depuis la fiche du projet." />
        <div class="mc-scr-prj-dates2">
          <McTextField v-model="fDebut" type="date" label="Début" />
          <McTextField v-model="fFin" type="date" label="Fin prévue" :error="finError" />
        </div>
      </div>
    </McModal>

    <McModal
      v-model:open="appOpen"
      title="Ajouter une application"
      :subtitle="inspected ? `Projet : ${inspected.name}` : undefined"
      :type="{ label: 'Application', icon: 'app', layer: 'applicatif' }"
      confirm-label="Ajouter"
      confirm-icon="plus"
      @confirm="confirmAddApp"
    >
      <div class="mc-scr-prj-form">
        <McSelect v-model="appPick" label="Application" required placeholder="Choisir une application" :options="appPickOptions" :error="appPickError" />
      </div>
    </McModal>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-prj { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-prj-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-prj-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-prj-main { flex: 1; min-width: 0; display: grid; gap: 16px; }
.mc-scr-prj-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-prj-titles { flex: 1; min-width: 180px; }
.mc-scr-prj-titles .mc-over { margin: 0 0 2px; }
.mc-scr-prj-titles h1 { margin: 0; }
.mc-scr-prj-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-prj-search { width: 300px; }
.mc-scr-prj-resp { width: 220px; }

.mc-scr-prj-board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start; }
.mc-scr-prj-col { display: grid; gap: 10px; padding: 12px; border-radius: var(--radius-lg); background: var(--surface-sunken); min-width: 0; }
.mc-scr-prj-colh { margin: 0 0 2px; display: flex; align-items: center; gap: 8px; font: 600 13px/18px var(--font-display); }
.mc-scr-prj-count { color: var(--ink-subtle); }
.mc-scr-prj-none { margin: 0; padding: 16px 8px; text-align: center; font-size: 13px; color: var(--ink-subtle); }

.mc-scr-prj-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-node); padding: 12px 14px; display: grid; gap: 10px; min-width: 0; transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
.mc-scr-prj-card:hover { box-shadow: var(--shadow-hover); }
.mc-scr-prj-card.is-on { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.mc-scr-prj-open { display: grid; gap: 4px; padding: 0; border: 0; background: transparent; text-align: left; color: inherit; font: inherit; cursor: pointer; border-radius: var(--radius-xs); }
.mc-scr-prj-open:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
.mc-scr-prj-name { font: 600 14px/20px var(--font-display); color: var(--ink); }
.mc-scr-prj-open:hover .mc-scr-prj-name { color: var(--accent); }
.mc-scr-prj-desc { font-size: 13px; line-height: 18px; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mc-scr-prj-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-prj-dates { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 16px; color: var(--ink-muted); font-variant-numeric: tabular-nums; }
.mc-scr-prj-progress { display: flex; align-items: center; gap: 8px; }
.mc-scr-prj-progress .tr { flex: 1; height: 6px; border-radius: 999px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-prj-progress .tr i { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
.mc-scr-prj-progress .v { font: 600 12px/16px var(--font-sans); color: var(--ink-muted); min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
.mc-scr-prj-apps { display: flex; flex-wrap: wrap; gap: 4px; }
.mc-scr-prj-app { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: var(--radius-pill); background: var(--layer-applicatif-soft); color: var(--ink); font: 600 11px/14px var(--font-sans); text-decoration: none; max-width: 100%; }
a.mc-scr-prj-app:hover { box-shadow: inset 0 0 0 1px var(--layer-applicatif); }
a.mc-scr-prj-app:focus-visible, .mc-scr-prj-more:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-prj-more { height: 22px; padding: 0 8px; border: 0; border-radius: var(--radius-pill); background: var(--surface-sunken); color: var(--ink-muted); font: 600 11px/14px var(--font-sans); cursor: pointer; }
.mc-scr-prj-foot { display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid var(--line); }
.mc-scr-prj-who { flex: 1; min-width: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 16px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-prj-links { display: inline-flex; gap: 2px; }
.mc-scr-prj-insp .body { grid-template-columns: minmax(0, 1fr); }
/* Les listes déroulantes du formulaire débordent de la modale au lieu d'être coupées. */
.mc-scr-prj-form { display: grid; gap: 16px; }
.mc-scr-prj-dates2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (min-width: 1800px) {
}
@media (max-width: 1180px) {
  .mc-scr-prj-titles { flex-basis: 100%; }
  .mc-scr-prj-search, .mc-scr-prj-resp { flex: 1 1 220px; width: auto; }
  /* À côté de l'inspecteur, trois colonnes deviendraient trop étroites : elles s'empilent. */
  .mc-scr-prj-board { grid-template-columns: minmax(0, 1fr); }
}
</style>
