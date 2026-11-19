import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McTabs, { type TabItem } from './McTabs.vue'

const fiche: TabItem[] = [
  { value: 'infos', label: 'Informations' },
  { value: 'relations', label: 'Relations', count: 12 },
  { value: 'cartes', label: 'Cartes', count: 4 },
  { value: 'historique', label: 'Historique' },
]
const vues: TabItem[] = [
  { value: 'fiche', label: 'Fiche', icon: 'info' },
  { value: 'flux', label: 'Flux', icon: 'flow' },
  { value: 'infra', label: 'Infrastructure', icon: 'server' },
  { value: 'pos', label: 'POS', icon: 'pos' },
]

const meta = {
  title: 'Navigation/Tabs',
  component: McTabs,
  args: { tabs: fiche, variant: 'underline', ariaLabel: 'Vues de l’objet' },
  parameters: {
    docs: {
      description: {
        component:
          'Onglets pour passer d’une vue à l’autre du même objet. **Soulignés** dans l’inspecteur et les modales, **pilule** pour les vues d’une même carte, au-dessus du canevas. 2 à 5 onglets, libellés d’un ou deux mots, compteur facultatif. `v-model` pour l’onglet actif ; flèches gauche/droite, Début et Fin au clavier. Le slot par défaut (facultatif) devient le panneau `tabpanel` de l’onglet actif.',
      },
    },
  },
  render: (args) => ({
    components: { McTabs },
    setup: () => ({ args, value: ref('infos') }),
    template: `<div style="max-width:420px"><McTabs v-bind="args" v-model="value">
      <template #default="{ value }"><p class="mc-cap" style="margin:0">Contenu de l’onglet « {{ value }} ».</p></template>
    </McTabs></div>`,
  }),
} satisfies Meta<typeof McTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Les deux variantes, avec compteurs, icônes et un onglet désactivé. Survoler un onglet inactif l’éclaircit. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTabs },
    setup: () => ({
      fiche,
      vues,
      a: ref('infos'),
      b: ref('relations'),
      c: ref('fiche'),
      d: ref('flux'),
      off: [...fiche.slice(0, 3), { value: 'historique', label: 'Historique', disabled: true }] as TabItem[],
      e: ref('infos'),
    }),
    template: `<div class="mc-col" style="gap:20px;max-width:460px">
      <span class="mc-over">Soulignés, premier actif</span><McTabs :tabs="fiche" v-model="a" />
      <span class="mc-over">Soulignés, compteur actif</span><McTabs :tabs="fiche" v-model="b" />
      <span class="mc-over">Soulignés, un onglet désactivé</span><McTabs :tabs="off" v-model="e" />
      <span class="mc-over">Pilule, vues de la carte</span><McTabs :tabs="vues" v-model="c" variant="pill" aria-label="Vues de la carte" />
      <span class="mc-over">Pilule, deuxième actif</span><McTabs :tabs="vues" v-model="d" variant="pill" aria-label="Vues de la carte" />
    </div>`,
  }),
}
