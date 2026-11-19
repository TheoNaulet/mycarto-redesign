import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McMinimap, { type McMinimapBlock } from './McMinimap.vue'

const blocks: McMinimapBlock[] = [
  { layer: 'applicatif', x: 5, y: 9, w: 47, h: 46 },
  { layer: 'technique', x: 58, y: 9, w: 34, h: 27 },
  { layer: 'metier', x: 5, y: 62, w: 26, h: 29 },
  { layer: 'fonctionnel', x: 36, y: 62, w: 56, h: 29 },
]

const meta = {
  title: 'Canevas/Minimap',
  component: McMinimap,
  args: { blocks, count: 142, zoom: 0.64, width: 200, height: 112, viewport: { x: 30, y: 18, w: 38, h: 41 }, collapsed: false },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Vue d’ensemble de la carte, en bas à gauche du canevas. Blocs aux couleurs de couche (55 %), placés en pourcentage de la carte ; cadre de vue accent (`v-model:viewport`, en %). **Glisser le cadre** déplace la vue ; **cliquer ailleurs** recentre le cadre là ; au clavier, les flèches le déplacent (Maj pour aller plus vite). Pied : nombre d’objets et zoom. Se replie en un bouton (`v-model:collapsed`).\n\nMasquée par défaut sur les petites cartes (moins de 30 objets).',
      },
    },
  },
  render: (args) => ({
    components: { McMinimap },
    setup: () => ({ args }),
    template: '<div><McMinimap v-bind="args" v-model:viewport="args.viewport" v-model:collapsed="args.collapsed" /><p class="mc-cap" style="margin-top:8px">Cadre : x {{ Math.round(args.viewport.x) }} %, y {{ Math.round(args.viewport.y) }} %</p></div>',
  }),
} satisfies Meta<typeof McMinimap>

export default meta
type Story = StoryObj<typeof meta>

/** Glisse le cadre bleu, clique ailleurs dans la vue, ou replie le panneau. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McMinimap },
    setup: () => ({
      blocks,
      v1: ref({ x: 30, y: 18, w: 38, h: 41 }),
      v2: ref({ x: 0, y: 0, w: 100, h: 100 }),
      v3: ref({ x: 70, y: 60, w: 18, h: 22 }),
      c: ref(true),
      small: [{ layer: 'applicatif', x: 20, y: 30, w: 25, h: 18 }, { layer: 'applicatif', x: 55, y: 30, w: 25, h: 18 }] as McMinimapBlock[],
    }),
    template: `<div class="mc-row lg" style="align-items:flex-end;gap:24px">
      <div class="mc-col"><span class="mc-over">Repos</span><McMinimap :blocks="blocks" :count="142" :zoom="0.64" v-model:viewport="v1" /></div>
      <div class="mc-col"><span class="mc-over">Tout est visible</span><McMinimap :blocks="blocks" :count="142" :zoom="0.25" v-model:viewport="v2" /></div>
      <div class="mc-col"><span class="mc-over">Zoom fort, petite carte</span><McMinimap :blocks="small" :count="2" :zoom="2.5" v-model:viewport="v3" :width="150" :height="72" /></div>
      <div class="mc-col"><span class="mc-over">Replié</span><McMinimap :blocks="blocks" :count="142" v-model:collapsed="c" /></div>
    </div>`,
  }),
}
