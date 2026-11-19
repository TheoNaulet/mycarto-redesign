import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McMapTrail, { type TrailStep } from './McMapTrail.vue'

const court: TrailStep[] = [
  { label: 'Accueil', href: '#' },
  { label: 'Domaines', layer: 'fonctionnel' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'Applications et flux' },
]
const long: TrailStep[] = [
  { label: 'Accueil' },
  { label: 'Domaines', layer: 'fonctionnel' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'APOGEE', layer: 'applicatif' },
  { label: 'sophocle', layer: 'technique' },
  { label: "Impact d'un arrêt" },
]

const meta = {
  title: 'Navigation/MapTrail',
  component: McMapTrail,
  args: { steps: long, max: 4, compactHome: false },
  parameters: {
    docs: {
      description: {
        component:
          'Fil d’Ariane des cartes : chaque étape est une carte d’où l’on vient, avec le point de couleur de sa couche. La première étape est l’accueil, la dernière la carte courante (sans lien). **Au-delà de `max` étapes (4), celles du milieu se replient dans « … »**, qui ouvre un menu (flèches, Entrée, Échap). Le chemin suit la navigation réelle, pas une arborescence théorique. Événement : `navigate(step, index)`.',
      },
    },
  },
  render: (args) => ({
    components: { McMapTrail },
    setup: () => {
      const last = ref('')
      return { args, last, onNav: (s: TrailStep) => (last.value = s.label) }
    },
    template: `<div class="mc-col">
      <McMapTrail v-bind="args" @navigate="onNav" />
      <span class="mc-cap">Dernière étape cliquée : {{ last || '—' }}</span>
    </div>`,
  }),
} satisfies Meta<typeof McMapTrail>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Court, replié (ouvrir « … »), accueil réduit, une seule étape. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McMapTrail },
    setup: () => ({ court, long }),
    template: `<div class="mc-col" style="gap:20px;padding-bottom:120px">
      <div class="mc-col" style="gap:4px"><span class="mc-over">4 étapes, tout visible</span><McMapTrail :steps="court" /></div>
      <div class="mc-col" style="gap:4px"><span class="mc-over">6 étapes, milieu replié</span><McMapTrail :steps="long" /></div>
      <div class="mc-col" style="gap:4px"><span class="mc-over">Accueil réduit à la maison</span><McMapTrail :steps="long" compact-home /></div>
      <div class="mc-col" style="gap:4px"><span class="mc-over">Seulement l'accueil</span><McMapTrail :steps="[{ label: 'Accueil' }]" /></div>
    </div>`,
  }),
}
