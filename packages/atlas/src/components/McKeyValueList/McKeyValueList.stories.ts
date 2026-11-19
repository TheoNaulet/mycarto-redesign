import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McKeyValueList from './McKeyValueList.vue'
import type { KeyValueItem } from './types'

const apogee: KeyValueItem[] = [
  { key: 'Nom', value: 'APOGEE' },
  { key: 'Description', value: 'Gestion des inscriptions administratives et pédagogiques, des examens et des diplômes de l’ensemble des étudiants' },
  { key: 'Statut', value: 'Active' },
  { key: 'Hébergement', value: 'On-premise' },
  { key: 'Domaine', value: 'Scolarité', href: '#' },
  { key: 'Éditeur', value: 'AMUE', href: '#' },
  { key: 'Version', value: '6.10.2', code: true },
  { key: 'Nombre d’utilisateurs', value: 1250 },
  { key: 'Coût total de possession annuel', value: '48 000 € / an' },
  { key: 'Date de fin de support', value: null },
  { key: 'Référent fonctionnel', value: '' },
]
const meta_ = ['Créé le 12/03/2021 par Théo Naulet', 'Modifié le 18/05/2026 à 11:01 par William V.']

const meta = {
  title: 'Données/KeyValueList',
  component: McKeyValueList,
  args: { items: apogee, meta: meta_, loading: false, loadingRows: 6, emptyLabel: 'Non renseigné' },
  parameters: {
    docs: {
      description: {
        component:
          'Les attributs d’un objet, dans l’inspecteur et les fiches. Clé à gauche (40 %, 96px minimum), **jamais tronquée** : elle passe à la ligne. La valeur passe aussi à la ligne. Valeur vide : « Non renseigné » en gris clair. Les objets liés deviennent des liens (`open`). Les dates système sont regroupées en bas.',
      },
    },
  },
  render: (args) => ({
    components: { McKeyValueList },
    setup: () => ({ args }),
    template: '<div style="max-width:340px"><McKeyValueList v-bind="args" /></div>',
  }),
} satisfies Meta<typeof McKeyValueList>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Rempli (avec valeurs vides, lien, code, texte long), chargement, colonne étroite. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McKeyValueList },
    setup: () => ({ apogee, meta_ }),
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px;align-items:start">
      <div class="mc-col"><span class="mc-over">Rempli</span><McKeyValueList :items="apogee" :meta="meta_" /></div>
      <div class="mc-col"><span class="mc-over">Chargement</span><McKeyValueList loading /></div>
      <div class="mc-col" style="max-width:240px"><span class="mc-over">Étroit : les clés passent à la ligne</span><McKeyValueList :items="apogee.slice(6, 10)" /></div>
    </div>`,
  }),
}

export const Chargement: Story = { args: { loading: true } }
