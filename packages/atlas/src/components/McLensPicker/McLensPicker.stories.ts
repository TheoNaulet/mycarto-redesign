import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McLensPicker from './McLensPicker.vue'
import { MC_LENSES } from './lenses'

const meta = {
  title: 'Canevas/LensPicker',
  component: McLensPicker,
  args: { lens: 'contrats', open: false, placement: 'bottom', heading: 'Lire la carte par' },
  argTypes: {
    lens: { control: 'select', options: MC_LENSES.map((l) => l.id) },
    placement: { control: 'inline-radio', options: ['top', 'bottom'] },
  },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'La lentille : une lecture de la carte qui colore les nœuds selon un critère et génère sa légende. Le bouton passe en **jaune** quand une lentille est active, son sous-titre dit laquelle. Il ouvre la liste des lentilles (`MC_LENSES` par défaut, « Aucune » comprise) ; `v-model:lens` porte l’identifiant choisi, `v-model:open` l’ouverture.\n\nClavier : Entrée ou Espace ouvre, flèches haut/bas parcourent, Entrée choisit, Échap ferme et rend le focus au bouton. Un clic ailleurs ferme. Une seule lentille à la fois.',
      },
    },
  },
  render: (args) => ({
    components: { McLensPicker },
    setup: () => ({ args }),
    template: '<div style="min-height:420px"><McLensPicker v-bind="args" v-model:lens="args.lens" v-model:open="args.open" /></div>',
  }),
} satisfies Meta<typeof McLensPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McLensPicker },
    setup: () => ({ a: ref('aucune'), b: ref('obsolescence'), c: ref('contrats'), open: ref(true) }),
    template: `<div class="mc-row lg" style="align-items:flex-start;min-height:440px;gap:32px">
      <div class="mc-col"><span class="mc-over">Aucune lentille</span><McLensPicker v-model:lens="a" placement="bottom" /></div>
      <div class="mc-col"><span class="mc-over">Lentille active</span><McLensPicker v-model:lens="b" placement="bottom" /></div>
      <div class="mc-col"><span class="mc-over">Ouvert</span><McLensPicker v-model:lens="c" v-model:open="open" placement="bottom" /></div>
    </div>`,
  }),
}
