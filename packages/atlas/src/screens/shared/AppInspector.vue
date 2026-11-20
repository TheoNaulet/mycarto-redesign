<script setup lang="ts">
// Inspecteur d'application des écrans en liste (Glossaire, Criticité, Applications obsolètes) :
// colonne toujours là à droite. Sans application : un résumé de la liste ; au clic : l'essentiel de la fiche,
// avec « Ouvrir la fiche » pour la page complète.
import { appLogo } from '../../logos/appLogo'
import { computed } from 'vue'
import McInspector from '../../components/McInspector/McInspector.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McDicpBadge from '../../components/McDicpBadge/McDicpBadge.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import { goFiche, goPath } from '../bridge'
import { getApplication, type Application } from '../../data/applications'

const props = defineProps<{
  /** Application inspectée ; absente : état vide avec le résumé. */
  app?: Application
  /** Titre de l'état vide : « Sélectionnez une application ». */
  emptyTitle?: string
  /** Phrase sous le titre de l'état vide. */
  emptyText?: string
  /** Résumé de la liste montré sans sélection (totaux, alertes). */
  summary?: KeyValueItem[]
}>()

const emit = defineEmits<{
  /** Fermeture (croix ou Échap) : retour au résumé. */
  close: []
  /** Clic sur une application liée : l'écran l'inspecte à son tour. */
  inspect: [app: Application]
}>()

const OBSO_LABEL: Record<string, string> = { critical: 'Infra obsolète', warn: 'Fin de support proche' }

const kv = computed<KeyValueItem[]>(() => {
  const a = props.app
  if (!a) return []
  return [
    { key: 'Statut', value: a.statut },
    { key: 'Nature', value: a.nature },
    { key: a.domaines.length > 1 ? 'Domaines' : 'Domaine', value: a.domaines.join(', ') },
    { key: 'Sécurité', value: 'dicp' },
    { key: 'Hébergement', value: a.hebergement },
    { key: 'Mise en service', value: a.miseEnService },
    { key: 'Fin de service', value: a.finDeService },
    { key: 'Éditeur', value: a.editeur ?? a.fournisseur, href: a.editeur || a.fournisseur ? '/fournisseurs' : undefined },
    { key: 'Groupe propriétaire', value: a.groupe },
  ]
})

const groups = computed<RelationGroup[]>(() => {
  const a = props.app
  if (!a) return []
  const peers = [...new Set(a.flows.map((f) => (f.from === a.name ? f.to : f.from)))]
  return [
    {
      verb: 'Hébergée sur',
      items: a.hosts.map((h) => ({ id: `m-${h.name}`, name: h.name, layer: 'technique', icon: 'server', meta: h.kind === 'VM' ? 'VM' : 'Machine', status: h.status, statusLabel: h.statusLabel })),
      emptyLabel: a.hebergement === 'SaaS' ? 'Hébergée en SaaS chez l’éditeur' : 'Aucune machine liée',
    },
    {
      verb: 'Échange avec',
      items: peers.map((n) => ({ id: `a-${n}`, name: n, layer: 'applicatif', icon: 'app', meta: `${a.flows.filter((f) => f.from === n || f.to === n).length} flux` })),
      emptyLabel: 'Aucun flux déclaré',
    },
    {
      verb: 'Référents',
      items: a.referents.map((r) => ({ id: `r-${r.name}`, name: r.name, layer: 'metier', icon: 'user', meta: r.role })),
      emptyLabel: 'Aucun référent',
    },
  ]
})

function openKv(item: KeyValueItem, e: MouseEvent) {
  e.preventDefault()
  if (item.href) goPath(item.href)
}
function openRelation(item: RelationItem) {
  const id = String(item.id ?? '')
  if (id.startsWith('m-')) return goPath(`/machines?id=${encodeURIComponent(item.name)}`)
  if (id.startsWith('r-')) return goPath('/referents')
  const app = getApplication(item.name)
  if (app) emit('inspect', app)
}
const mapPath = computed(() => props.app?.maps.find((m) => m.path)?.path)
</script>

<template>
  <McInspector
    :key="app?.slug ?? 'resume'"
    class="mc-insp-dock"
    :object="app ? { name: app.name, type: 'Application', layer: 'applicatif', icon: 'app', logo: appLogo(app.name), description: app.description ?? undefined } : undefined"
    :empty-title="emptyTitle ?? 'Sélectionnez une application'"
    :empty-text="emptyText ?? 'Son statut, sa sécurité, son hébergement et ses échanges s’affichent ici.'"
    @close="emit('close')"
  >
    <template v-if="summary?.length" #empty><McKeyValueList :items="summary" /></template>
    <template v-if="app" #statuses>
      <McStatusChip v-if="app.statut" size="sm">{{ app.statut }}</McStatusChip>
      <McStatusChip v-if="app.obsolescence && OBSO_LABEL[app.obsolescence.status]" :status="app.obsolescence.status" size="sm">{{ OBSO_LABEL[app.obsolescence.status] }}</McStatusChip>
    </template>
    <template v-if="app" #actions>
      <McButton size="sm" variant="secondary" icon="external" @click="goFiche(app.slug)">Ouvrir la fiche</McButton>
      <McIconButton v-if="mapPath" size="sm" icon="map" label="Voir sur une carte" @click="goPath(mapPath)" />
    </template>
    <template v-if="app">
      <McKeyValueList :items="kv" :meta="app.modifiee ? [`Modifiée le ${app.modifiee}`] : []" @open="openKv">
        <template #value="{ item }">
          <McDicpBadge v-if="item.key === 'Sécurité'" v-bind="app.dicp" />
          <span v-else-if="item.value === undefined || item.value === null || item.value === ''" class="mc-app-insp-empty">Non renseigné</span>
          <a v-else-if="item.href" :href="item.href" class="mc-kv-link" @click="openKv(item, $event)">{{ item.value }}</a>
          <template v-else>{{ item.value }}</template>
        </template>
      </McKeyValueList>
      <McRelationList :groups="groups" :visible="4" @open="openRelation" />
    </template>
  </McInspector>
</template>

<style>
.mc-app-insp-empty { color: var(--ink-subtle); }
</style>
