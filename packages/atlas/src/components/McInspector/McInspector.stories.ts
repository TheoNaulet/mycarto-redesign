import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McInspector, { type InspectedObject } from './McInspector.vue'
import McButton from '../McButton/McButton.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import McIcon from '../../icons/McIcon.vue'
import type { TabItem } from '../McTabs/McTabs.vue'

const apogee: InspectedObject = { name: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app', description: 'Gestion des étudiants et des enseignements.' }
const tabs: TabItem[] = [
  { value: 'infos', label: 'Infos' },
  { value: 'relations', label: 'Relations', count: 14 },
  { value: 'cartes', label: 'Cartes', count: 4 },
]

const slots = `<template #statuses><McStatusChip status="critical" size="sm">Infra obsolète</McStatusChip></template>
<template #actions>
  <McButton size="sm" icon="map">Ouvrir la carte</McButton>
  <McButton size="sm" variant="outline" icon="pencil">Modifier</McButton>
  <button type="button" class="mc-ibtn sm" aria-label="Plus d’actions"><McIcon name="more" size="sm" /></button>
</template>
<template #default="{ tab }">
  <dl v-if="tab === 'infos'" class="mc-kv">
    <dt>Statut</dt><dd><span class="mc-chip sm neutral">Active</span></dd>
    <dt>Sécurité</dt><dd><span class="mc-dicp"><span class="c2">D</span><span class="c4">I</span><span class="c3">C</span><span class="c4">P</span></span></dd>
    <dt>Utilisateurs</dt><dd>32 · Scolarité centrale, composantes, enseignants</dd>
    <dt>Mise en service</dt><dd>14/03/2021</dd>
    <dt>Fin de service</dt><dd class="empty">Non renseignée</dd>
    <dt>Éditeur</dt><dd><a href="#" style="color:var(--accent)">AMUE</a></dd>
  </dl>
  <div v-else-if="tab === 'relations'" class="mc-rel">
    <div class="verb"><span class="mc-over grow">Hébergée sur</span><span class="mc-count">2</span></div>
    <div class="row l-technique"><span class="tile"><McIcon name="cloud" /></span><span class="grow">sophocle</span></div>
    <div class="row l-technique"><span class="tile"><McIcon name="software" /></span><span class="grow">Tomcat 5</span></div>
    <div class="verb" style="margin-top:8px"><span class="mc-over grow">Échange avec</span><span class="mc-count">12</span></div>
    <div class="row l-applicatif"><span class="tile"><McIcon name="app" /></span><span class="grow">CALCIUM</span></div>
  </div>
  <p v-else class="mc-cap" style="margin:0">4 cartes montrent APOGEE : Applications et flux, Infrastructure, Impact d’un arrêt, Place dans le POS.</p>
</template>`

const meta = {
  title: 'Surfaces/Inspector',
  component: McInspector,
  args: { object: apogee, tabs, loading: false, error: undefined },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Panneau flottant à droite qui montre l’objet sélectionné : tuile, nom, puce de type, états (slot `statuses`), actions (slot `actions` : « Ouvrir la carte » en primary, « Modifier » en outline, « … »), onglets (`v-model:tab`) et corps (slot par défaut, reçoit `tab`). **Clic sur un nœud : l’inspecteur s’ouvre ou se met à jour, la carte ne bouge pas.** Échap ou la croix : `close`. États : chargement (squelette), erreur (« Réessayer » émet `retry`), vide (« Sélectionnez un objet sur la carte »).',
      },
    },
  },
  render: (args) => ({
    components: { McInspector, McButton, McStatusChip, McIcon },
    setup: () => ({ args, tab: ref('infos'), shown: ref(true) }),
    template: `<div style="display:flex;justify-content:flex-end;min-height:560px">
      <McInspector v-if="shown" v-bind="args" v-model:tab="tab" @close="shown = false">${slots}</McInspector>
      <McButton v-else variant="outline" @click="shown = true">Rouvrir l’inspecteur</McButton>
    </div>`,
  }),
} satisfies Meta<typeof McInspector>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Objet (Infos), objet (Relations), chargement, erreur, vide. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McInspector, McButton, McStatusChip, McIcon },
    setup: () => {
      const retrying = ref(false)
      function retry() {
        retrying.value = true
        setTimeout(() => (retrying.value = false), 1200)
      }
      return { apogee, tabs, a: ref('infos'), b: ref('relations'), retrying, retry }
    },
    template: `<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      <McInspector :object="apogee" :tabs="tabs" v-model:tab="a">${slots}</McInspector>
      <McInspector :object="apogee" :tabs="tabs" v-model:tab="b">${slots}</McInspector>
      <McInspector loading />
      <McInspector :object="retrying ? undefined : apogee" :loading="retrying" :error="retrying ? undefined : 'Le serveur n’a pas répondu. Vérifiez votre connexion puis réessayez.'" @retry="retry" />
      <McInspector />
    </div>`,
  }),
}
