import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McTypeChip from './McTypeChip.vue'

const couches = [
  {
    nom: 'Métier',
    types: [
      { type: 'Processus', layer: 'metier', icon: 'process' },
      { type: 'Unité organisationnelle', layer: 'metier', icon: 'org' },
      { type: 'Référent métier', layer: 'metier', icon: 'user' },
    ],
  },
  {
    nom: 'Fonctionnelle',
    types: [
      { type: 'POS', layer: 'fonctionnel', icon: 'pos' },
      { type: 'Domaine', layer: 'fonctionnel', icon: 'folder' },
      { type: 'Donnée', layer: 'fonctionnel', icon: 'database' },
    ],
  },
  {
    nom: 'Applicative',
    types: [
      { type: 'Application', layer: 'applicatif', icon: 'app' },
      { type: 'Flux', layer: 'applicatif', icon: 'flow' },
      { type: 'Projet', layer: 'applicatif', icon: 'project' },
      { type: 'Contrat', layer: 'applicatif', icon: 'contract' },
    ],
  },
  {
    nom: 'Technique',
    types: [
      { type: 'Site', layer: 'technique', icon: 'building' },
      { type: 'Rack', layer: 'technique', icon: 'rack' },
      { type: 'Machine virtuelle', layer: 'technique', icon: 'cloud' },
      { type: 'Logiciel', layer: 'technique', icon: 'software' },
    ],
  },
]

const meta = {
  title: 'Repères/TypeChip',
  component: McTypeChip,
  args: { type: 'Application', layer: 'applicatif', icon: 'app', size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Puce qui dit le type d’un objet, avec la couleur de sa couche dans la pastille. Le texte reste `ink` : la couleur de couche n’est jamais du texte, et elle dit le type, jamais l’état (l’état passe par StatusChip). Toujours le nom du type en toutes lettres.',
      },
    },
  },
} satisfies Meta<typeof McTypeChip>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Les 4 couches, en taille normale et petite. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTypeChip },
    setup: () => ({ couches }),
    template: `<div style="display:grid;grid-template-columns:110px auto;gap:12px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <template v-for="c in couches" :key="c.nom">
        <span>{{ c.nom }}</span>
        <div class="mc-col" style="gap:6px">
          <div class="mc-row"><McTypeChip v-for="t in c.types" :key="t.type" v-bind="t" /></div>
          <div class="mc-row"><McTypeChip v-for="t in c.types" :key="t.type" v-bind="t" size="sm" /></div>
        </div>
      </template>
    </div>`,
  }),
}
