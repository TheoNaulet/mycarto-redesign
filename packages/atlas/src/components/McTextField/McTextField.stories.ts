import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McTextField from './McTextField.vue'

const meta = {
  title: 'Saisie/TextField',
  component: McTextField,
  args: { label: 'Nom de l’application', placeholder: 'ex. Gestion des étudiants', required: true },
  parameters: {
    docs: {
      description: {
        component:
          'Champ de saisie avec son libellé, son aide et son message d’erreur. Le libellé est au-dessus, le placeholder est un exemple. Un message d’erreur dit ce qui ne va pas et comment corriger. `v-model` pour la valeur.',
      },
    },
  },
  render: (args) => ({
    components: { McTextField },
    setup: () => ({ args, value: ref('') }),
    template: '<div style="max-width:360px"><McTextField v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof McTextField>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTextField },
    setup: () => ({ a: ref(''), b: ref('ASTRE RH'), c: ref('14/13/2021'), d: ref('APOGEE'), e: ref('FX00011'), f: ref('12400') }),
    template: `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,320px));gap:20px 24px">
      <McTextField label="Vide" placeholder="ex. Gestion des étudiants" v-model="a" />
      <McTextField label="Rempli" v-model="b" help="Visible dans toutes les cartes." />
      <McTextField label="Erreur" v-model="c" icon-end="calendar" error="Date invalide : utilisez le format JJ/MM/AAAA." required />
      <McTextField label="Modifié" v-model="d" modified />
      <McTextField label="Lecture seule" v-model="e" readonly />
      <McTextField label="Désactivé" v-model="b" disabled />
      <McTextField label="Avec unité" v-model="f" suffix="€ / an" type="number" />
      <McTextField label="Petit, avec icône" placeholder="Rechercher" icon="search" size="sm" />
    </div>`,
  }),
}
