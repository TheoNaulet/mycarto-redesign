import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McContextMenu, { type ContextMenuItem } from './McContextMenu.vue'
import McNode from '../McNode/McNode.vue'
import McIcon from '../../icons/McIcon.vue'

const nodeItems: (ContextMenuItem | 'separator')[] = [
  { id: 'open', label: 'Ouvrir la fiche', icon: 'info', shortcut: 'Entrée' },
  { id: 'maps', label: 'Cartes associées', icon: 'map', children: [{ label: 'Applications et flux' }, { label: 'Infrastructure' }] },
  { id: 'impact', label: "Voir l'impact d'un arrêt", icon: 'impact' },
  { id: 'flows', label: 'Mettre en évidence les flux', icon: 'flow', shortcut: '⇧F' },
  'separator',
  { id: 'link', label: 'Copier le lien', icon: 'link', shortcut: '⌘L' },
  { id: 'sticky', label: 'Ajouter un post-it', icon: 'sticky', shortcut: 'S' },
  'separator',
  { id: 'hide', label: 'Masquer de la carte', icon: 'eye-off', danger: true },
]

const meta = {
  title: 'Surfaces/ContextMenu',
  component: McContextMenu,
  args: { items: nodeItems, header: 'APOGEE', width: 260, inline: false },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Menu contextuel sombre, ouvert au clic droit sur un nœud ou par le bouton « … ». Icône, libellé (verbe à l’infinitif), raccourci, chevron de sous-menu ; séparateurs fins, titre en surtitre. **9 actions au plus avant un sous-menu ; une action destructrice va en dernier.** `v-model:open`, position `x`/`y` dans le conteneur positionné le plus proche. Clavier : flèches, Début/Fin, Entrée, Échap (rend le focus). Clic ailleurs : fermeture. Événement `select(item)`.',
      },
    },
  },
  render: (args) => ({
    components: { McContextMenu, McNode, McIcon },
    setup: () => {
      const open = ref(false)
      const x = ref(0)
      const y = ref(0)
      const last = ref('')
      const area = ref<HTMLElement | null>(null)
      function at(e: MouseEvent) {
        const r = area.value!.getBoundingClientRect()
        x.value = e.clientX - r.left
        y.value = e.clientY - r.top
        open.value = true
      }
      function fromButton(e: MouseEvent) {
        const b = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const r = area.value!.getBoundingClientRect()
        x.value = b.left - r.left
        y.value = b.bottom - r.top + 6
        open.value = !open.value
      }
      return { args, open, x, y, last, area, at, fromButton }
    },
    template: `<div ref="area" style="position:relative;height:420px">
      <div style="display:flex;align-items:center;gap:8px">
        <McNode name="APOGEE" type="Application" layer="applicatif" icon="app" subtitle="32 utilisateurs" @contextmenu.prevent="at" />
        <button type="button" class="mc-ibtn" aria-label="Actions sur APOGEE" aria-haspopup="menu" :aria-expanded="open" @click="fromButton"><McIcon name="more" /></button>
      </div>
      <p class="mc-cap">Clic droit sur le nœud, ou bouton « … ». Dernière action : {{ last || '—' }}</p>
      <McContextMenu v-bind="args" v-model:open="open" :x="x" :y="y" @select="(it) => (last = it.label)" />
    </div>`,
  }),
} satisfies Meta<typeof McContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Menu de nœud complet (survoler pour l’état actif), actions désactivées, sans titre. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McContextMenu },
    setup: () => ({
      nodeItems,
      disabled: [
        { label: 'Ouvrir la fiche', icon: 'info', shortcut: 'Entrée' },
        { label: 'Modifier', icon: 'pencil', disabled: true },
        { label: 'Dupliquer', icon: 'copy', disabled: true },
        'separator',
        { label: 'Supprimer', icon: 'trash', danger: true, disabled: true },
      ] as (ContextMenuItem | 'separator')[],
      simple: [
        { label: 'Ajuster à la carte', icon: 'fit', shortcut: '⇧1' },
        { label: 'Ajouter un post-it', icon: 'sticky', shortcut: 'S' },
        { label: 'Coller', icon: 'copy', shortcut: '⌘V' },
      ] as ContextMenuItem[],
    }),
    template: `<div class="mc-row lg" style="align-items:flex-start">
      <div class="mc-col" style="gap:6px"><span class="mc-over">Sur un nœud</span><McContextMenu :items="nodeItems" header="APOGEE" :open="true" inline /></div>
      <div class="mc-col" style="gap:6px"><span class="mc-over">Lecture seule</span><McContextMenu :items="disabled" header="Tomcat 5" :open="true" inline :width="220" /></div>
      <div class="mc-col" style="gap:6px"><span class="mc-over">Sur le canevas vide</span><McContextMenu :items="simple" :open="true" inline :width="220" aria-label="Canevas" /></div>
    </div>`,
  }),
}
