import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import McRelationList from './McRelationList.vue'
import type { RelationGroup } from './types'

const apogee: RelationGroup[] = [
  {
    verb: 'Appartient à',
    items: [
      { name: 'Scolarité', layer: 'fonctionnel', icon: 'folder' },
      { name: 'Référentiel', layer: 'fonctionnel', icon: 'folder' },
    ],
    addLabel: 'Ajouter un domaine',
  },
  {
    verb: 'Hébergée sur',
    items: [
      { name: 'sophocle', layer: 'technique', icon: 'server', status: 'critical', statusLabel: 'Tomcat 5', meta: 'Production' },
      { name: 'pythagore', layer: 'technique', icon: 'cloud', status: 'warn', statusLabel: '2027', meta: 'Recette' },
      { name: 'platon', layer: 'technique', icon: 'server', status: 'ok', statusLabel: 'À jour' },
    ],
    addLabel: 'Ajouter une machine',
  },
  {
    verb: 'Échange avec',
    items: ['ABYLA', 'ACTIVE DIRECTORY', 'AGRHUM', 'ALERTES-DIPLOMES', 'AMANDE', 'APOGEE WEB', 'APOIP', 'ASTRE RH', 'BIBASSE', 'C2I', 'CALCIUM'].map(
      (name, i) => ({ id: i, name, layer: 'applicatif' as const, icon: 'app' as const, meta: i % 3 ? undefined : `${(i % 4) + 1} flux` }),
    ),
    addLabel: 'Ajouter un flux',
  },
  {
    verb: 'Éditée par',
    items: [{ name: 'AMUE', layer: 'applicatif', icon: 'building' }],
    addLabel: 'Choisir un éditeur',
    max: 1,
  },
  { verb: 'Couverte par', items: [], addLabel: 'Ajouter un contrat', emptyLabel: 'Aucun contrat lié' },
]

const meta = {
  title: 'Données/RelationList',
  component: McRelationList,
  args: { groups: apogee, visible: 5, loading: false, loadingGroups: 2, onAdd: fn(), onOpen: fn(), onMore: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Les relations d’un objet, groupées par verbe et lues depuis l’objet courant (« APOGEE · appartient à · Scolarité »). Chaque objet lié est un mini-nœud cliquable (`open`). Au-delà de 5 objets, « Voir les N » déplie le groupe (`more`). « Ajouter » en pointillé (`add`) disparaît quand la relation est limitée à un seul objet et remplie. La cardinalité technique (NN, 1N) n’est jamais affichée.',
      },
    },
  },
  render: (args) => ({
    components: { McRelationList },
    setup: () => ({ args }),
    template: '<div style="max-width:340px"><McRelationList v-bind="args" /></div>',
  }),
} satisfies Meta<typeof McRelationList>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Groupe normal, avec états, débordant (« Voir les 11 »), limité à un objet (sans +), vide ; puis chargement. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McRelationList },
    setup: () => ({ apogee }),
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,340px));gap:32px;align-items:start">
      <McRelationList :groups="apogee" />
      <McRelationList loading :loading-groups="3" />
    </div>`,
  }),
}

export const Groupe_vide: Story = {
  name: 'Groupe vide',
  args: { groups: [{ verb: 'Hébergée sur', items: [], addLabel: 'Ajouter une machine', emptyLabel: 'Aucune machine liée : l’impact d’une panne ne peut pas être calculé.' }] },
}

export const Chargement: Story = { args: { loading: true } }
