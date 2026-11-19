import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { ref } from 'vue'
import McHomeSearch from './McHomeSearch.vue'
import type { HomeSearchSuggestion } from './types'

const suggestions: HomeSearchSuggestion[] = [
  { label: 'APOGEE', layer: 'applicatif', icon: 'app' },
  { label: 'Scolarité', layer: 'fonctionnel', icon: 'folder' },
  { label: 'sophocle', layer: 'technique', icon: 'server' },
  { label: 'Tomcat 5', layer: 'technique', icon: 'software' },
  { label: 'Inscription administrative', layer: 'metier', icon: 'process' },
]

const meta = {
  title: 'Accueil/HomeSearch',
  component: McHomeSearch,
  args: {
    placeholder: 'Une application, un flux, une machine, une carte…',
    shortcut: '⌘K',
    hotkey: false,
    suggestions,
    suggestionsLabel: 'Consultés récemment',
    onSearch: fn(),
    onPick: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'La grande recherche de l’accueil. Ce n’est pas un champ : c’est un bouton qui ouvre la palette de recherche (`search`), comme ⌘K / Ctrl+K partout dans l’application. Dessous, des puces vers les objets consultés récemment, à la couleur de leur couche (`pick`).',
      },
    },
  },
  render: (args) => ({
    components: { McHomeSearch },
    setup: () => ({ args }),
    template: '<McHomeSearch v-bind="args" />',
  }),
} satisfies Meta<typeof McHomeSearch>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Avec suggestions, sans suggestions, et le raccourci ⌘K actif (essayer : la ligne du bas se met à jour). */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McHomeSearch },
    setup: () => ({ suggestions, last: ref('Rien pour l’instant') }),
    template: `<div class="mc-col" style="gap:28px">
      <div class="mc-col"><span class="mc-over">Avec suggestions</span>
        <McHomeSearch :suggestions="suggestions" :hotkey="false" @search="last = 'Palette ouverte (clic)'" @pick="(s) => (last = 'Suggestion : ' + s.label)" /></div>
      <div class="mc-col"><span class="mc-over">Sans suggestions, raccourci ⌘K / Ctrl+K actif</span>
        <McHomeSearch @search="last = 'Palette ouverte (raccourci ou clic)'" /></div>
      <span class="mc-cap">Dernière action : {{ last }}</span>
    </div>`,
  }),
}
