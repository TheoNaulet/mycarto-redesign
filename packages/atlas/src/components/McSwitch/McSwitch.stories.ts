import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McSwitch from './McSwitch.vue'

const meta = {
  title: 'Saisie/Switch',
  component: McSwitch,
  args: { label: 'Afficher les flux', help: '', disabled: false, block: false },
  parameters: {
    docs: {
      description: {
        component:
          'Interrupteur pour un réglage qui s’applique immédiatement : libellé à gauche, interrupteur à droite. **Jamais de bouton « Appliquer » après un interrupteur.** Pour une sélection multiple, utiliser Checkbox.',
      },
    },
  },
  render: (args) => ({
    components: { McSwitch },
    setup: () => ({ args, value: ref(true) }),
    template: '<div class="mc-col" style="max-width:300px"><McSwitch v-bind="args" v-model="value" /><span class="mc-cap">Valeur : {{ value }}</span></div>',
  }),
} satisfies Meta<typeof McSwitch>

export default meta
type Story = StoryObj<typeof meta>

/** Clic, Espace ou Entrée pour basculer. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McSwitch },
    setup: () => ({ a: ref(true), b: ref(false), c: ref(true) }),
    template: `<div class="mc-col" style="max-width:320px">
      <McSwitch v-model="a" label="Allumé" block />
      <McSwitch v-model="b" label="Éteint (survol : passer la souris)" block />
      <McSwitch v-model="c" label="Appliquer la lentille" help="Colore les nœuds selon leur état." block />
      <McSwitch :model-value="true" label="Allumé, désactivé" disabled block />
      <McSwitch :model-value="false" label="Éteint, désactivé" disabled block />
      <McSwitch v-model="b" aria-label="Afficher les post-its" />
    </div>`,
  }),
}

/** Réglages d'affichage d'une carte, dans un panneau. */
export const Panneau_d_affichage: Story = {
  name: 'Panneau d’affichage',
  render: () => ({
    components: { McSwitch },
    setup: () => ({ flux: ref(true), postits: ref(false), lentille: ref(true) }),
    template: `<div class="mc-float mc-col" style="max-width:300px;padding:16px">
      <span class="mc-over">Affichage</span>
      <McSwitch v-model="flux" label="Afficher les flux" block />
      <McSwitch v-model="postits" label="Afficher les post-its" block />
      <McSwitch v-model="lentille" label="Appliquer la lentille" block />
    </div>`,
  }),
}
