import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McLensPicker from '../McLensPicker/McLensPicker.vue'
import McToolbar from './McToolbar.vue'

const meta = {
  title: 'Canevas/Toolbar',
  component: McToolbar,
  args: { readonly: false, collaboration: true, filterActive: false, shortcuts: false, tool: 'select', zoom: 1, legend: false },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Barre d’outils flottante, en bas au centre du canevas. De gauche à droite : outils (Sélection V, Main H, `v-model:tool`), lentille (slot `lens`, en général `McLensPicker`), Filtrer et Légende (`v-model:legend`, bouton enfoncé), Post-it et Commentaire (masqués en lecture seule), zoom (`v-model:zoom`, facteur : 1 = 100 % ; clic sur le pourcentage = 100 %).\n\nLe jaune marque l’outil actif et la lentille active, rien d’autre. Chaque bouton a une infobulle « Nom (raccourci) ». Flèches gauche/droite pour passer d’un bouton à l’autre ; `shortcuts` active les raccourcis sur la page.\n\nÉvénements : `filter`, `sticky`, `comment`, `fit`.',
      },
    },
  },
  render: (args) => ({
    components: { McToolbar, McLensPicker },
    setup: () => {
      const lens = ref('aucune')
      return { args, lens }
    },
    template: `<div style="padding-top:340px;display:flex;justify-content:center">
      <McToolbar v-bind="args" v-model:tool="args.tool" v-model:zoom="args.zoom" v-model:legend="args.legend">
        <template #lens><McLensPicker v-model:lens="lens" /></template>
      </McToolbar>
    </div>`,
  }),
} satisfies Meta<typeof McToolbar>

export default meta
type Story = StoryObj<typeof meta>

/** Tout fonctionne : outils, lentille (la liste s’ouvre au-dessus), légende, zoom. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McToolbar, McLensPicker },
    setup: () => ({
      a: { tool: ref<'select' | 'hand'>('select'), zoom: ref(1), legend: ref(false), lens: ref('aucune') },
      b: { tool: ref<'select' | 'hand'>('hand'), zoom: ref(0.64), legend: ref(true), lens: ref('obsolescence') },
      c: { tool: ref<'select' | 'hand'>('select'), zoom: ref(0.1), legend: ref(false), lens: ref('aucune') },
      d: { tool: ref<'select' | 'hand'>('select'), zoom: ref(4), legend: ref(false), lens: ref('contrats') },
    }),
    template: `<div style="display:grid;gap:20px;justify-items:center;padding-top:300px">
      <div class="mc-col" style="align-items:center;gap:6px"><span class="mc-over">Repos</span>
        <McToolbar v-model:tool="a.tool.value" v-model:zoom="a.zoom.value" v-model:legend="a.legend.value">
          <template #lens><McLensPicker v-model:lens="a.lens.value" /></template>
        </McToolbar></div>
      <div class="mc-col" style="align-items:center;gap:6px"><span class="mc-over">Main, lentille active, filtres appliqués, légende ouverte</span>
        <McToolbar v-model:tool="b.tool.value" v-model:zoom="b.zoom.value" v-model:legend="b.legend.value" filter-active>
          <template #lens><McLensPicker v-model:lens="b.lens.value" /></template>
        </McToolbar></div>
      <div class="mc-col" style="align-items:center;gap:6px"><span class="mc-over">Lecture seule, zoom minimal</span>
        <McToolbar v-model:tool="c.tool.value" v-model:zoom="c.zoom.value" v-model:legend="c.legend.value" readonly>
          <template #lens><McLensPicker v-model:lens="c.lens.value" /></template>
        </McToolbar></div>
      <div class="mc-col" style="align-items:center;gap:6px"><span class="mc-over">Sans collaboration, zoom maximal</span>
        <McToolbar v-model:tool="d.tool.value" v-model:zoom="d.zoom.value" v-model:legend="d.legend.value" :collaboration="false">
          <template #lens><McLensPicker v-model:lens="d.lens.value" /></template>
        </McToolbar></div>
    </div>`,
  }),
}
