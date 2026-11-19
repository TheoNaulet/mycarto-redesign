import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McCommandPalette, { type PaletteItem } from './McCommandPalette.vue'
import McButton from '../McButton/McButton.vue'
import McIcon from '../../icons/McIcon.vue'

const items: PaletteItem[] = [
  { id: 'apogee', group: 'Objets', label: 'APOGEE', detail: '32 utilisateurs', type: 'Application', layer: 'applicatif', icon: 'app', status: 'critical', statusLabel: 'Obsolescence' },
  { id: 'apogee-web', group: 'Objets', label: 'APOGEE WEB', type: 'Application', layer: 'applicatif', icon: 'app' },
  { id: 'apoip', group: 'Objets', label: 'APOIP', type: 'Application', layer: 'applicatif', icon: 'app' },
  { id: 'scolarite', group: 'Objets', label: 'Scolarité', detail: '10 applications', type: 'Domaine', layer: 'fonctionnel', icon: 'folder' },
  { id: 'calcium', group: 'Objets', label: 'CALCIUM', type: 'Application', layer: 'applicatif', icon: 'app', status: 'ok', statusLabel: 'Active' },
  { id: 'tomcat5', group: 'Objets', label: 'Tomcat 5', detail: '1 déploiement', type: 'Logiciel', layer: 'technique', icon: 'software', status: 'critical', statusLabel: 'Obsolète' },
  { id: 'tomcat9', group: 'Objets', label: 'Tomcat 9', detail: '0 déploiement', type: 'Logiciel', layer: 'technique', icon: 'software', status: 'ok', statusLabel: 'Supporté' },
  { id: 'sophocle', group: 'Objets', label: 'sophocle', detail: 'héberge Tomcat 5', type: 'VM', layer: 'technique', icon: 'cloud' },
  { id: 'amue', group: 'Objets', label: 'AMUE', detail: '4 contrats', type: 'Fournisseur', layer: 'applicatif', icon: 'building' },
  { id: 'c-flux-apogee', group: 'Cartes', label: 'Les flux de APOGEE', type: 'Flux', icon: 'flow' },
  { id: 'c-scol', group: 'Cartes', label: 'Applications et flux de la Scolarité', type: 'Flux', icon: 'map' },
  { id: 'c-obso', group: 'Cartes', label: 'Les logiciels en statut Obsolète', type: 'Logiciels', icon: 'software' },
  { id: 'c-infra', group: 'Cartes', label: 'Infrastructure de APOGEE', type: 'Infrastructure', icon: 'server' },
  { id: 'a-impact', group: 'Actions', label: "Voir l'impact d'un arrêt de Tomcat 5", icon: 'impact', shortcut: '⌘I' },
  { id: 'a-lens', group: 'Actions', label: 'Appliquer la lentille Obsolescence', icon: 'lens', shortcut: 'L' },
  { id: 'a-export', group: 'Actions', label: 'Exporter la carte en PDF', icon: 'export', shortcut: '⌘E' },
  { id: 'a-sticky', group: 'Actions', label: 'Ajouter un post-it', icon: 'sticky', shortcut: 'S' },
]

const preview = `<template #preview="{ item }">
  <div style="display:flex;gap:12px;align-items:center">
    <span :style="{ width: '40px', height: '40px', borderRadius: '10px', background: item.layer ? 'var(--ls)' : 'var(--surface)', color: item.layer ? 'var(--lc)' : 'var(--ink-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }"><McIcon :name="item.icon ?? 'map'" size="lg" /></span>
    <div style="display:grid;min-width:0"><b class="title">{{ item.label }}</b><span class="mc-cap">{{ item.type ?? item.group }}</span></div>
  </div>
  <dl class="mc-kv" v-if="item.group === 'Objets'"><dt>Groupe</dt><dd>{{ item.group }}</dd><dt>Détail</dt><dd :class="{ empty: !item.detail }">{{ item.detail ?? 'Non renseigné' }}</dd><dt>État</dt><dd>{{ item.statusLabel ?? 'Non renseigné' }}</dd></dl>
  <p v-else class="mc-cap" style="margin:0">{{ item.group === 'Cartes' ? 'Ouvre la carte à son dernier zoom.' : 'Action sur la carte courante.' }}</p>
  <McButton size="sm" icon="map" style="justify-self:start">{{ item.group === 'Actions' ? 'Lancer' : 'Ouvrir sur sa carte' }}</McButton>
</template>`

const meta = {
  title: 'Surfaces/CommandPalette',
  component: McCommandPalette,
  args: { items, loading: false, emptyLimit: 4, contained: true, placeholder: 'Rechercher une carte, un objet, une action' },
  parameters: {
    pad: false,
    docs: {
      description: {
        component:
          'Recherche universelle (⌘K) : cartes, objets et actions dans un seul champ. Portées Tout · Cartes · Objets · Actions (avec leur compte), résultats groupés, **correspondance surlignée en `yellow-soft`** (sans casse ni accents). Clavier : ↑↓ naviguer, Entrée ouvrir, ⌘Entrée ouvrir à côté, Tab changer de portée, Échap fermer (le focus revient au déclencheur). Sans saisie : cartes récentes et favoris. Slot `preview` : aperçu du résultat actif à droite. États : chargement (squelettes), aucun résultat. `v-model:open`, `v-model:query`, `v-model:scope` ; `contained` pour l’afficher dans un cadre.',
      },
    },
  },
  render: (args) => ({
    components: { McCommandPalette, McButton, McIcon },
    setup: () => ({ args, open: ref(true), q: ref('apo'), last: ref('') }),
    template: `<div style="position:relative;height:620px;padding:24px" class="mc-canvas">
      <McButton variant="outline" icon="search" @click="open = true">Rechercher ⌘K</McButton>
      <p class="mc-cap">Ouvert : {{ last || '—' }}</p>
      <McCommandPalette v-bind="args" v-model:open="open" v-model:query="q" @select="(it, aside) => (last = it.label + (aside ? ' (à côté)' : ''))" />
    </div>`,
  }),
} satisfies Meta<typeof McCommandPalette>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** La palette large de l’écran Recherche, avec l’aperçu du résultat actif à droite. */
export const Avec_apercu: Story = {
  name: 'Avec aperçu',
  render: () => ({
    components: { McCommandPalette, McButton, McIcon },
    setup: () => ({ items, open: ref(true), q: ref('tomcat'), af: ref(false) }),
    template: `<div style="position:relative;height:620px;padding:24px" class="mc-canvas">
      <McButton variant="outline" icon="search" @click="af = true; open = true">Rechercher ⌘K</McButton>
      <McCommandPalette :items="items" v-model:open="open" v-model:query="q" contained :autofocus="af">${preview}</McCommandPalette>
    </div>`,
  }),
}

/** Sans saisie (récents), avec saisie, portée Objets, chargement, aucun résultat. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McCommandPalette },
    setup: () => ({
      items,
      states: [
        { title: 'Sans saisie : récents et favoris', q: ref(''), scope: ref('Tout'), loading: false },
        { title: 'Saisie « apo », tout', q: ref('apo'), scope: ref('Tout'), loading: false },
        { title: 'Portée Objets, « tomcat »', q: ref('tomcat'), scope: ref('Objets'), loading: false },
        { title: 'Chargement', q: ref('scol'), scope: ref('Tout'), loading: true },
        { title: 'Aucun résultat', q: ref('mumuz'), scope: ref('Cartes'), loading: false },
      ],
    }),
    template: `<div class="mc-col" style="gap:0">
      <div v-for="s in states" :key="s.title" style="position:relative;height:520px;border-bottom:1px solid var(--line)" class="mc-canvas">
        <span class="mc-over" style="position:absolute;left:16px;top:16px">{{ s.title }}</span>
        <McCommandPalette :items="items" :open="true" v-model:query="s.q.value" v-model:scope="s.scope.value" :loading="s.loading" contained :autofocus="false" />
      </div>
    </div>`,
  }),
}
