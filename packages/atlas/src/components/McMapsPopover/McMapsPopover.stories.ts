import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McMapsPopover, { type AssociatedMap, type MapsObject } from './McMapsPopover.vue'
import McIcon from '../../icons/McIcon.vue'

const scolarite: MapsObject = { name: 'Scolarité', type: 'Domaine', layer: 'fonctionnel', icon: 'folder' }
const apogee: MapsObject = { name: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app' }
const maps: AssociatedMap[] = [
  { title: 'Applications et flux', description: '10 applications, 34 flux', icon: 'flow' },
  { title: 'Applications du domaine', description: '10 applications', icon: 'app' },
  { title: 'Place dans le POS', description: 'Quartier Opération', icon: 'pos' },
]
const apogeeMaps: AssociatedMap[] = [
  { title: 'Les flux de APOGEE', description: '18 flux entrants, 9 sortants', icon: 'flow' },
  { title: 'Infrastructure', description: '4 VM, 2 bases de données', icon: 'server' },
  { title: "Impact d'un arrêt", description: '7 applications touchées', icon: 'impact' },
  { title: 'Contrat AMUE', description: 'Échéance 31/12/2026', icon: 'contract' },
]

const meta = {
  title: 'Surfaces/MapsPopover',
  component: McMapsPopover,
  args: { object: scolarite, maps, inline: false, align: 'start' },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Popover « Cartes associées » : les cartes qu’on peut ouvrir depuis un objet ou une tuile d’accueil. En-tête avec la puce de l’objet et le nombre de cartes ; chaque carte a sa vignette, son titre, un fait (« 10 applications, 34 flux ») et une flèche. **S’ouvre au clic, jamais au seul survol** ; se ferme avec Échap ou un clic ailleurs. Avec une seule carte, ouvrir directement sans popover. Slot `trigger` (`toggle`, `aria`), `v-model:open`, événement `open(map)`.',
      },
    },
  },
  render: (args) => ({
    components: { McMapsPopover, McIcon },
    setup: () => ({ args, open: ref(false), last: ref('') }),
    template: `<div style="height:300px" class="mc-col">
      <McMapsPopover v-bind="args" v-model:open="open" @open="(m) => (last = m.title)">
        <template #trigger="{ toggle, aria }">
          <button type="button" class="mc-btn outline" v-bind="aria" @click="toggle"><McIcon name="map" />{{ args.maps.length }} cartes</button>
        </template>
      </McMapsPopover>
      <span class="mc-cap">Carte ouverte : {{ last || '—' }}</span>
    </div>`,
  }),
} satisfies Meta<typeof McMapsPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Trois cartes (survoler : ligne active), quatre cartes d’une application, aucune carte. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McMapsPopover },
    setup: () => ({ scolarite, apogee, maps, apogeeMaps, tomcat: { name: 'Tomcat 5', type: 'Logiciel', layer: 'technique', icon: 'software' } as MapsObject }),
    template: `<div class="mc-row lg" style="align-items:flex-start">
      <McMapsPopover :object="scolarite" :maps="maps" inline />
      <McMapsPopover :object="apogee" :maps="apogeeMaps" inline />
      <McMapsPopover :object="tomcat" :maps="[]" inline />
    </div>`,
  }),
}
