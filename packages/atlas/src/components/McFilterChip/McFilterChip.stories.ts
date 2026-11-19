import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McFilterChip from './McFilterChip.vue'
import McButton from '../McButton/McButton.vue'

const tousLesFiltres = [
  'Couche : Applicative',
  'Statut : Obsolète',
  'Domaine : Scolarité',
  'Éditeur : AMUE',
  'Serveur : sophocle',
  'Logiciel : Tomcat 5',
]

const meta = {
  title: 'Repères/FilterChip',
  component: McFilterChip,
  args: { label: 'Couche : Applicative', removable: true, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Puce d’un filtre ou d’une lentille appliqué, qu’on retire d’un clic sur la croix. Le libellé nomme le filtre et sa valeur : « Statut : Obsolète ». Au-delà de 3 puces, la dernière devient « +2 filtres », et « Tout effacer » suit les puces.',
      },
    },
  },
  render: (args) => ({
    components: { McFilterChip, McButton },
    setup: () => ({ args, retire: ref(false) }),
    template: `<div class="mc-row"><McFilterChip v-if="!retire" v-bind="args" @remove="retire = true" />
      <McButton v-else variant="ghost" size="sm" @click="retire = false">Remettre le filtre</McButton></div>`,
  }),
} satisfies Meta<typeof McFilterChip>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McFilterChip },
    template: `<div style="display:grid;grid-template-columns:160px auto;gap:12px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>Repos</span><div><McFilterChip label="Statut : Obsolète" /></div>
      <span>Survol de la croix</span><div><McFilterChip label="Statut : Obsolète" /></div>
      <span>Non retirable</span><div><McFilterChip label="Domaine : Scolarité" :removable="false" /></div>
      <span>Désactivé</span><div><McFilterChip label="Éditeur : AMUE" disabled /></div>
      <span>Débordement</span><div class="mc-row"><McFilterChip :overflow="1" /><McFilterChip :overflow="2" /><McFilterChip :overflow="12" /></div>
    </div>`,
  }),
}

/** Barre de filtres qui marche : retire une puce, ouvre « +N filtres », ou efface tout. */
export const Barre_de_filtres: Story = {
  name: 'Barre de filtres',
  render: () => ({
    components: { McFilterChip, McButton },
    setup: () => {
      const filtres = ref([...tousLesFiltres])
      const tout = ref(false)
      const visibles = computed(() => (tout.value || filtres.value.length <= 3 ? filtres.value : filtres.value.slice(0, 2)))
      const masques = computed(() => filtres.value.length - visibles.value.length)
      const retirer = (f: string) => (filtres.value = filtres.value.filter((x) => x !== f))
      const effacer = () => { filtres.value = []; tout.value = false }
      const remettre = () => { filtres.value = [...tousLesFiltres]; tout.value = false }
      return { filtres, visibles, masques, tout, retirer, effacer, remettre }
    },
    template: `<div class="mc-col">
      <div class="mc-row" v-if="filtres.length">
        <McFilterChip v-for="f in visibles" :key="f" :label="f" @remove="retirer(f)" />
        <McFilterChip v-if="masques > 0" :overflow="masques" @expand="tout = true" />
        <McButton variant="ghost" size="sm" @click="effacer">Tout effacer</McButton>
      </div>
      <div class="mc-row" v-else><span class="mc-cap">Aucun filtre appliqué.</span><McButton variant="ghost" size="sm" @click="remettre">Remettre les filtres</McButton></div>
      <span class="mc-cap">{{ filtres.length === 0 ? 'Aucun filtre' : filtres.length === 1 ? '1 filtre appliqué' : filtres.length + ' filtres appliqués' }}</span>
    </div>`,
  }),
}
