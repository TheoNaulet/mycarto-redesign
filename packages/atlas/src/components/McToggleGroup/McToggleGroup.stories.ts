import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McToggleGroup from './McToggleGroup.vue'

const vues = [
  { value: 'carte', label: 'Carte', icon: 'map' as const },
  { value: 'grille', label: 'Grille', icon: 'dashboard' as const },
  { value: 'tableau', label: 'Tableau', icon: 'list' as const },
]
const densites = [
  { value: 'detaille', label: 'Détaillé' },
  { value: 'compact', label: 'Compact' },
]
const themes = [
  { value: 'clair', label: 'Clair' },
  { value: 'sombre', label: 'Sombre' },
  { value: 'systeme', label: 'Système' },
]

const meta = {
  title: 'Actions/ToggleGroup',
  component: McToggleGroup,
  args: { options: vues, label: 'Vue de la liste', iconOnly: false, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Choix exclusif entre 2 à 4 modes d’affichage d’une même chose (Carte / Grille / Tableau). Il change un mode, il ne lance jamais une action. Au clavier : Tab entre dans le groupe, les flèches changent d’option. Au-delà de 4 options, utiliser un Select.',
      },
    },
  },
  render: (args) => ({
    components: { McToggleGroup },
    setup: () => ({ args, value: ref('carte') }),
    template: `<div class="mc-col"><McToggleGroup v-bind="args" v-model="value" /><span class="mc-cap">Valeur : {{ value }}</span></div>`,
  }),
} satisfies Meta<typeof McToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Joue avec les contrôles ; les flèches du clavier changent d'option. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McToggleGroup },
    setup: () => ({ vues, densites, themes, a: ref('carte'), b: ref('compact'), c: ref('systeme'), d: ref('grille'), e: ref('carte') }),
    template: `<div style="display:grid;grid-template-columns:140px auto;gap:16px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>Icône et libellé</span><McToggleGroup :options="vues" label="Vue de la liste" v-model="a" />
      <span>Libellé seul</span><McToggleGroup :options="densites" label="Densité des nœuds" v-model="b" />
      <span>3 options</span><McToggleGroup :options="themes" label="Thème" v-model="c" />
      <span>Icône seule</span><McToggleGroup :options="vues" label="Vue de la liste" icon-only v-model="d" />
      <span>Désactivé</span><McToggleGroup :options="vues" label="Vue de la liste" disabled v-model="e" />
    </div>`,
  }),
}
