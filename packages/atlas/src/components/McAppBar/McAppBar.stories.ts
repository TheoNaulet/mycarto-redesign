import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McAppBar from './McAppBar.vue'
import McButton from '../McButton/McButton.vue'
import type { TrailStep } from '../McMapTrail/McMapTrail.vue'

const trail: TrailStep[] = [
  { label: 'Accueil' },
  { label: 'Domaines', layer: 'fonctionnel' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'Applications et flux' },
]
const longTrail: TrailStep[] = [
  { label: 'Accueil' },
  { label: 'Domaines', layer: 'fonctionnel' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'APOGEE', layer: 'applicatif' },
  { label: 'sophocle', layer: 'technique' },
  { label: "Impact d'un arrêt" },
]

const actions = `<span class="mc-avatars" aria-label="2 personnes sur la carte"><span class="mc-avatar" title="Anne Simon">AS</span><span class="mc-avatar" style="background:var(--data-4)" title="William Vidal">WV</span></span>
  <McButton variant="outline" icon="export">Exporter</McButton>
  <McButton variant="primary" icon="pencil">Modifier</McButton>`

const meta = {
  title: 'Navigation/AppBar',
  component: McAppBar,
  args: { trail, searchLabel: 'Rechercher', searchShortcut: '⌘K', listenShortcut: true, hideSearch: false, trailMax: 4 },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Barre flottante en haut du canevas : la marque (retour à l’accueil), où l’on est (`McMapTrail` ou `meta`), la recherche ⌘K qui ouvre la `CommandPalette` (événement `search`), puis le slot `actions` : présences, « Exporter » (outline) et « Modifier » (primary). **En lecture seule, « Modifier » disparaît et « Exporter » devient le bouton jaune.** La date de génération va dans l’inspecteur de la carte, pas dans la barre.',
      },
    },
  },
  render: (args) => ({
    components: { McAppBar, McButton },
    setup: () => {
      const opened = ref(0)
      return { args, opened }
    },
    template: `<div class="mc-col">
      <McAppBar v-bind="args" @search="opened++">
        <template #actions>${actions}</template>
      </McAppBar>
      <span class="mc-cap">Recherche ouverte {{ opened }} fois (clic ou ⌘K).</span>
    </div>`,
  }),
} satisfies Meta<typeof McAppBar>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Fil court, fil replié, titre à la place du fil, lecture seule, sans recherche. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McAppBar, McButton },
    setup: () => ({ trail, longTrail }),
    template: `<div class="mc-col" style="gap:20px;padding-bottom:120px">
      <span class="mc-over">Carte, droits de modification</span>
      <McAppBar :trail="trail" :listen-shortcut="false"><template #actions>${actions}</template></McAppBar>
      <span class="mc-over">Chemin long, milieu replié</span>
      <McAppBar :trail="longTrail" :listen-shortcut="false"><template #actions>${actions}</template></McAppBar>
      <span class="mc-over">Lecture seule : Exporter devient jaune</span>
      <McAppBar :trail="trail" :listen-shortcut="false"><template #actions><McButton variant="primary" icon="export">Exporter</McButton></template></McAppBar>
      <span class="mc-over">Hors carte : titre et sous-titre</span>
      <McAppBar :meta="{ title: 'Explorateur', subtitle: '65 applications' }" :listen-shortcut="false" />
      <span class="mc-over">Sans recherche</span>
      <McAppBar :trail="trail" hide-search />
    </div>`,
  }),
}
