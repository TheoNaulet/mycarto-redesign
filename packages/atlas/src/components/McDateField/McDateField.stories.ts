import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McDateField from './McDateField.vue'

const meta = {
  title: 'Saisie/DateField',
  component: McDateField,
  args: { label: 'Mise en service' },
  parameters: {
    docs: {
      description: {
        component:
          'Champ de date au format JJ/MM/AAAA. On tape les chiffres (les barres s’ajoutent seules) ou on clique sur l’icône pour ouvrir le calendrier du navigateur. Une date qui n’existe pas est signalée en quittant le champ. `v-model` pour la valeur.',
      },
    },
  },
  render: (args) => ({
    components: { McDateField },
    setup: () => ({ args, value: ref('14/03/2021') }),
    template: '<div style="max-width:320px"><McDateField v-bind="args" v-model="value" /><p class="mc-cap">Valeur : {{ value || "—" }}</p></div>',
  }),
} satisfies Meta<typeof McDateField>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McDateField },
    setup: () => ({ a: ref(''), b: ref('14/03/2021'), c: ref('31/02/2021') }),
    template: `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,280px));gap:20px 24px">
      <McDateField label="Vide" v-model="a" help="Laissez vide si aucune fin n'est prévue." />
      <McDateField label="Rempli" v-model="b" />
      <McDateField label="Erreur" v-model="c" error="Date invalide : utilisez le format JJ/MM/AAAA." />
      <McDateField label="Modifié" v-model="b" modified />
      <McDateField label="Lecture seule" v-model="b" readonly />
      <McDateField label="Désactivé" v-model="b" disabled />
    </div>`,
  }),
}
