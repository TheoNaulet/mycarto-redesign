<script setup lang="ts">
// Écran « Pays » (couche métier) : les pays de l'établissement et leurs sites.
// Aucun pays n'est saisi au départ : l'état vide propose d'en ajouter un, ou de rattacher les 3 sites connus à la France.
import { computed, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McNode from '../../components/McNode/McNode.vue'
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
import type { RelationGroup } from '../../components/McRelationList/types'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { paysConnus, sitesCartographies, zones, type PaysRef } from '../../data/pays'
import { traitements } from '../../data/rgpd'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Pays saisis (en mémoire) ---------- */
interface PaysSaisi extends PaysRef {
  sites: string[]
}
const pays = ref<PaysSaisi[]>([])
const byCode = (code: string) => pays.value.find((p) => p.code === code)
const sitesCount = computed(() => pays.value.reduce((n, p) => n + p.sites.length, 0))

const query = ref('')
const filtered = computed(() => {
  const q = norm(query.value.trim())
  const list = q ? pays.value.filter((p) => norm(`${p.name} ${p.code} ${p.sites.join(' ')}`).includes(q)) : pays.value
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
})
const groups = computed(() => zones.map((z) => ({ zone: z, items: filtered.value.filter((p) => p.zone === z) })).filter((g) => g.items.length))
const searchCount = computed(() => (query.value.trim() ? (filtered.value.length ? plural(filtered.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))

/** Villes saisies : « Lyon, montpellier » → ['Lyon', 'Montpellier'], sans doublon. */
function parseSites(text: string): string[] {
  const out: string[] = []
  for (const raw of text.split(/[,;\n]/)) {
    const s = raw.trim().replace(/\s+/g, ' ')
    if (!s) continue
    const city = s.charAt(0).toUpperCase() + s.slice(1)
    if (!out.some((o) => norm(o) === norm(city))) out.push(city)
  }
  return out
}

/* ---------- Ajout d'un pays ---------- */
const addOpen = ref(false)
const addCode = ref<McSelectValue | null>(null)
const addSites = ref<string | number>('')
const tried = ref(false)
const addOptions = computed(() => paysConnus.filter((p) => !byCode(p.code)).map((p) => ({ value: p.code, label: p.name })))
const addError = computed(() => (tried.value && !addCode.value ? 'Choisissez un pays dans la liste.' : undefined))
function openAdd() {
  addCode.value = null
  addSites.value = ''
  tried.value = false
  addOpen.value = true
}
function confirmAdd() {
  tried.value = true
  const ref_ = paysConnus.find((p) => p.code === addCode.value)
  if (!ref_) return
  const sites = parseSites(String(addSites.value ?? ''))
  pays.value.push({ ...ref_, sites })
  addOpen.value = false
  inspectedCode.value = ref_.code
  toast.success(sites.length ? `Pays ajouté : ${ref_.name}, avec ${plural(sites.length, 'site', 'sites')}` : `Pays ajouté : ${ref_.name}`, {
    actionLabel: 'Annuler',
    onAction: () => removePays(ref_.code, true),
  })
}

/** Rattache les sites déjà cartographiés à leur pays (France). */
function importSites() {
  const ref_ = paysConnus.find((p) => p.code === sitesCartographies.pays)!
  const existing = byCode(ref_.code)
  if (existing) {
    for (const s of sitesCartographies.sites) if (!existing.sites.includes(s)) existing.sites.push(s)
  } else {
    pays.value.push({ ...ref_, sites: [...sitesCartographies.sites] })
  }
  inspectedCode.value = ref_.code
  toast.success(existing ? `${ref_.name} : sites rattachés, ${sitesCartographies.sites.join(', ')}` : `Pays ajouté : ${ref_.name}, avec ${plural(sitesCartographies.sites.length, 'site', 'sites')} (${sitesCartographies.sites.join(', ')})`)
}
const sitesPending = computed(() => {
  const fr = byCode(sitesCartographies.pays)
  return sitesCartographies.sites.filter((s) => !fr?.sites.includes(s))
})

/* ---------- Ajout d'un site ---------- */
const siteOpen = ref(false)
const siteName = ref<string | number>('')
const siteTried = ref(false)
const siteError = computed(() => {
  if (!siteTried.value) return undefined
  const v = String(siteName.value ?? '').trim()
  if (!v) return 'Saisissez la ville du site.'
  const p = inspected.value
  if (p && parseSites(v).every((s) => p.sites.some((x) => norm(x) === norm(s)))) return `Ce site est déjà rattaché à ${p.name}.`
  return undefined
})
function openSite() {
  siteName.value = ''
  siteTried.value = false
  siteOpen.value = true
}
function confirmSite() {
  siteTried.value = true
  const p = inspected.value
  if (!p || siteError.value) return
  const added = parseSites(String(siteName.value)).filter((s) => !p.sites.some((x) => norm(x) === norm(s)))
  p.sites.push(...added)
  siteOpen.value = false
  toast.success(added.length > 1 ? `${p.name} : ${added.length} sites ajoutés (${added.join(', ')})` : `${p.name} : site ajouté, ${added[0]}`)
}

/* ---------- Suppression ---------- */
const deleteOpen = ref(false)
function removePays(code: string, silent = false) {
  const i = pays.value.findIndex((p) => p.code === code)
  if (i < 0) return
  const [removed] = pays.value.splice(i, 1)
  if (inspectedCode.value === code) inspectedCode.value = null
  if (!silent) {
    toast.success(`Pays supprimé : ${removed.name}`, {
      actionLabel: 'Annuler',
      onAction: () => {
        pays.value.splice(i, 0, removed)
        inspectedCode.value = removed.code
      },
    })
  }
}
function confirmDelete() {
  if (inspected.value) removePays(inspected.value.code)
  deleteOpen.value = false
}

/* ---------- Inspecteur ---------- */
const inspectedCode = ref<string | null>(null)
const inspected = computed(() => (inspectedCode.value ? byCode(inspectedCode.value) : undefined))
function inspect(code: string) {
  inspectedCode.value = inspectedCode.value === code ? null : code
}
const kv = computed<KeyValueItem[]>(() => {
  const p = inspected.value
  if (!p) return []
  return [
    { key: 'Code ISO', value: p.code, code: true },
    { key: 'Continent', value: p.zone },
    { key: 'Union européenne', value: p.ue ? 'Oui' : 'Non' },
    { key: 'Sites', value: p.sites.length },
  ]
})
/** Un site déjà cartographié s'ouvre dans l'écran Sites ; une ville saisie ici filtre la liste des pays. */
function openSiteRelation(item: { name: string }) {
  if (sitesCartographies.sites.some((s) => norm(s) === norm(item.name))) goPath('/sites')
  else query.value = item.name
}
const relations = computed<RelationGroup[]>(() => {
  const p = inspected.value
  if (!p) return []
  return [
    {
      verb: 'Sites',
      items: p.sites.map((s) => ({ id: s, name: s, layer: 'technique' as const, icon: 'pin' as const })),
      emptyLabel: 'Aucun site rattaché à ce pays',
      addLabel: 'Ajouter un site',
    },
  ]
})

/* ---------- Transferts hors UE (registre des traitements) ---------- */
const horsUE = traitements.filter((t) => t.horsUE)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Pays' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
function follow(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}
const paletteOpen = ref(false)
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Pays', value: pays.value.length }, { key: 'Sites rattachés', value: sitesCount.value }, { key: 'Hors Union européenne', value: pays.value.filter((p) => !p.ue).length }])
</script>

<template>
  <div class="mc-scr-pays">
    <McAppBar class="mc-scr-pays-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton v-if="pays.length" icon="plus" @click="openAdd">Ajouter un pays</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-pays-wrap">
      <main class="mc-scr-pays-main">
        <header class="mc-scr-pays-head">
          <div class="mc-scr-pays-titles">
            <p class="mc-over">Couche métier</p>
            <h1 class="title-lg">Pays <span class="mc-scr-pays-n">{{ pays.length }}</span></h1>
            <p v-if="pays.length" class="mc-scr-pays-sub">{{ plural(pays.length, 'pays', 'pays') }} · {{ plural(sitesCount, 'site', 'sites') }}</p>
          </div>
          <McSearchField v-if="pays.length" v-model="query" class="mc-scr-pays-search" placeholder="Rechercher un pays ou un site" :count="searchCount" />
        </header>

        <section v-if="!pays.length" class="mc-scr-pays-empty">
          <McEmptyState icon="globe" layer="metier" title="Aucun pays saisi">
            Les pays rangent les sites de l’établissement et signalent les données transférées hors de l’Union européenne.
            La cartographie compte déjà {{ sitesCartographies.sites.length }} sites : {{ sitesCartographies.sites.join(', ') }}.
            <template #action>
              <div class="mc-row mc-scr-pays-empty-acts">
                <McButton icon="plus" @click="openAdd">Ajouter un pays</McButton>
                <McButton variant="outline" icon="pin" @click="importSites">Rattacher les {{ sitesCartographies.sites.length }} sites à la France</McButton>
              </div>
            </template>
          </McEmptyState>
        </section>

        <template v-else>
          <div v-if="sitesPending.length" class="mc-scr-pays-hint" role="note">
            <span>{{ plural(sitesPending.length, 'site cartographié n’a', 'sites cartographiés n’ont') }} pas encore de pays : {{ sitesPending.join(', ') }}.</span>
            <McButton size="sm" variant="outline" icon="pin" @click="importSites">Rattacher à la France</McButton>
          </div>

          <section v-for="g in groups" :key="g.zone" class="mc-scr-pays-zone" :aria-label="g.zone">
            <h2 class="mc-scr-pays-zh">{{ g.zone }} <span>{{ g.items.length }}</span></h2>
            <div class="mc-scr-pays-grid">
              <div v-for="p in g.items" :key="p.code" class="mc-scr-pays-cell">
                <McNode
                  layer="metier"
                  icon="globe"
                  type="Pays"
                  :name="p.name"
                  :subtitle="p.sites.length ? plural(p.sites.length, 'site', 'sites') : 'Aucun site'"
                  :selected="inspectedCode === p.code"
                  :title="p.sites.length ? `${p.name} : ${p.sites.join(', ')}` : p.name"
                  @select="inspect(p.code)"
                  @open="inspect(p.code)"
                />
                <McStatusChip class="mc-scr-pays-st" :status="p.ue ? 'neutral' : 'warn'" size="sm">{{ p.ue ? 'Union européenne' : 'Hors UE' }}</McStatusChip>
              </div>
            </div>
          </section>
          <McEmptyState v-if="!groups.length" icon="search" layer="metier" title="Aucun pays ne correspond" text="Cherchez un autre nom de pays ou de ville.">
            <template #action><McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton></template>
          </McEmptyState>
        </template>

        <p class="mc-cap mc-scr-pays-note">
          <template v-if="horsUE.length">
            {{ plural(horsUE.length, 'traitement transfère', 'traitements transfèrent') }} des données hors de l’Union européenne :
            {{ horsUE.map((t) => t.name).join(', ') }}.
          </template>
          <a :href="pathHref('/traitements')" @click="follow($event, '/traitements')">Voir le registre des traitements</a>
        </p>
      </main>

      <McInspector
        :key="inspected?.code ?? 'resume'"
        class="mc-insp-dock mc-scr-pays-insp"
        :object="inspected ? { name: inspected.name, type: 'Pays', layer: 'metier', icon: 'globe' } : undefined"
        empty-title="Sélectionnez un pays"
        empty-text="Ses sites et leur rattachement à l’Union européenne s’affichent ici."
        @close="inspectedCode = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McStatusChip :status="inspected.ue ? 'neutral' : 'warn'" size="sm">{{ inspected.ue ? 'Union européenne' : 'Hors UE' }}</McStatusChip>
        </template>
        <template v-if="inspected" #actions>
          <McButton size="sm" variant="outline" icon="pin" @click="openSite">Ajouter un site</McButton>
          <McIconButton size="sm" icon="trash" variant="danger" :label="`Supprimer ${inspected.name}`" @click="deleteOpen = true" />
        </template>
        <template v-if="inspected">
          <McKeyValueList :items="kv" />
          <McRelationList :groups="relations" :visible="8" @open="openSiteRelation" @add="openSite" />
        </template>
      </McInspector>
    </div>

    <McModal
      v-model:open="addOpen"
      title="Ajouter un pays"
      :type="{ label: 'Pays', icon: 'globe', layer: 'metier' }"
      confirm-label="Ajouter"
      confirm-icon="plus"
      @confirm="confirmAdd"
    >
      <div class="mc-scr-pays-form">
        <McSelect v-model="addCode" label="Pays" required placeholder="Choisir un pays" :options="addOptions" :error="addError" :search-from="6" />
        <McTextField v-model="addSites" label="Sites" placeholder="ex. Lyon, Montpellier" help="Facultatif. Une ou plusieurs villes, séparées par une virgule." />
      </div>
    </McModal>

    <McModal
      v-model:open="siteOpen"
      :title="'Ajouter un site'"
      :subtitle="inspected ? `Pays : ${inspected.name}` : undefined"
      :type="{ label: 'Site', icon: 'pin', layer: 'technique' }"
      confirm-label="Ajouter"
      confirm-icon="plus"
      @confirm="confirmSite"
    >
      <div class="mc-scr-pays-form">
        <McTextField v-model="siteName" label="Ville" required placeholder="ex. Marseille" :error="siteError" help="Plusieurs villes : séparez-les par une virgule." />
      </div>
    </McModal>

    <McModal
      v-model:open="deleteOpen"
      :title="inspected ? `Supprimer ${inspected.name} ?` : 'Supprimer ce pays ?'"
      danger
      confirm-label="Supprimer"
      confirm-icon="trash"
      @confirm="confirmDelete"
    >
      <p v-if="inspected" class="mc-scr-pays-modal">
        <template v-if="inspected.sites.length">{{ inspected.sites.length > 1 ? `Ses ${inspected.sites.length} sites restent` : 'Son site reste' }} dans la cartographie, sans pays.</template>
        <template v-else>Aucun site n’est rattaché à ce pays.</template>
        Vous pourrez annuler juste après.
      </p>
    </McModal>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-pays { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-pays-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-pays-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-pays-main { flex: 1; min-width: 0; display: grid; gap: 18px; }
.mc-scr-pays-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-pays-titles { flex: 1; min-width: 180px; }
.mc-scr-pays-titles .mc-over { margin: 0 0 2px; }
.mc-scr-pays-titles h1 { margin: 0; }
.mc-scr-pays-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-pays-sub { margin: 2px 0 0; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-pays-search { width: 280px; }
.mc-scr-pays-empty { background: var(--surface); border: 1px dashed var(--line-strong); border-radius: var(--radius-lg); padding: 24px; }
.mc-scr-pays-empty .mc-empty { max-width: 560px; margin: 0 auto; }
.mc-scr-pays-empty-acts { gap: 8px; flex-wrap: wrap; justify-content: center; }
.mc-scr-pays-hint { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 14px; border-radius: var(--radius-md); background: var(--layer-metier-soft); font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-pays-hint > span { flex: 1; min-width: 220px; }
.mc-scr-pays-zone { display: grid; gap: 8px; }
.mc-scr-pays-zh { margin: 0; font: 600 13px/18px var(--font-display); color: var(--ink-muted); text-transform: uppercase; letter-spacing: .06em; }
.mc-scr-pays-zh span { color: var(--ink-subtle); margin-left: 4px; }
.mc-scr-pays-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px 14px; }
.mc-scr-pays-cell { position: relative; min-width: 0; }
.mc-scr-pays-cell > .mc-node { width: auto; padding-right: 140px; }
.mc-scr-pays-st { position: absolute; right: 10px; top: calc(14px + 15px); pointer-events: none; }
.mc-scr-pays-note { margin: 0; }
.mc-scr-pays-note a { color: var(--accent); }
.mc-scr-pays-insp .body { grid-template-columns: minmax(0, 1fr); }
/* Les listes déroulantes du formulaire débordent de la modale au lieu d'être coupées. */
.mc-scr-pays-form { display: grid; gap: 16px; }
.mc-scr-pays-modal { margin: 0; font-size: 14px; line-height: 20px; color: var(--ink-muted); }
@media (min-width: 1800px) {
}
@media (max-width: 1180px) {
  .mc-scr-pays-search { flex: 1 1 220px; width: auto; }
}
</style>
