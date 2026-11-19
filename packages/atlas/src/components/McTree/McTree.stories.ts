import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McTree, { type TreeNode } from './McTree.vue'
import McTreeItem from './McTreeItem.vue'
import McIcon from '../../icons/McIcon.vue'

const types: TreeNode[] = [
  {
    id: 'metier',
    label: 'Couche métier',
    layer: 'metier',
    children: [
      { id: 'processus', label: 'Processus', count: 48 },
      { id: 'acteur', label: 'Acteur', count: 19 },
    ],
  },
  {
    id: 'fonctionnel',
    label: 'Couche fonctionnelle',
    layer: 'fonctionnel',
    children: [
      { id: 'domaine', label: 'Domaine', count: 12 },
      { id: 'fonction', label: 'Fonction', count: 86 },
    ],
  },
  {
    id: 'applicatif',
    label: 'Couche applicative',
    layer: 'applicatif',
    children: [
      { id: 'application', label: 'Application', count: 65 },
      { id: 'flux', label: 'Flux', count: 142 },
      { id: 'fournisseur', label: 'Fournisseur', count: 27 },
      { id: 'contrat', label: 'Contrat', count: 22 },
    ],
  },
  {
    id: 'technique',
    label: 'Couche technique',
    layer: 'technique',
    children: [
      { id: 'vm', label: 'VM', count: 214 },
      {
        id: 'logiciel',
        label: 'Logiciel',
        count: 37,
        children: [
          { id: 'tomcat', label: 'Tomcat', count: 4 },
          { id: 'oracle', label: 'Oracle Database', count: 6 },
        ],
      },
    ],
  },
  { id: 'bpmn', label: 'Processus (BPMN)', layer: 'metier', children: [{ id: 'm14', label: 'M1.4 Suivi de la scolarité' }] },
]

const meta = {
  title: 'Navigation/Tree',
  component: McTree,
  args: { nodes: types, groupRoots: true, ariaLabel: 'Types d’objets' },
  parameters: {
    docs: {
      description: {
        component:
          'Arborescence : types d’objets de l’explorateur, dictionnaires, couches d’une carte. **Le premier niveau de l’explorateur, ce sont les 4 couches** (point `layer-*`), avec le nombre d’occurrences à droite de chaque type. `v-model` pour le nœud sélectionné, `v-model:expanded` pour les nœuds dépliés, slot `action` affiché au survol (« + »). Clavier : flèches haut/bas, droite pour déplier ou descendre, gauche pour replier ou remonter, Entrée pour choisir. Chaque ligne est un `McTreeItem`.',
      },
    },
  },
  render: (args) => ({
    components: { McTree, McIcon },
    setup: () => ({ args, sel: ref<string | null>('application'), open: ref(['applicatif']), added: ref('') }),
    template: `<div style="max-width:280px" class="mc-col">
      <McTree v-bind="args" v-model="sel" v-model:expanded="open">
        <template #action="{ node }">
          <button v-if="!node.children" type="button" class="mc-ibtn sm" :aria-label="'Créer : ' + node.label" @click="added = node.label"><McIcon name="plus" size="sm" /></button>
        </template>
      </McTree>
      <span class="mc-cap">Sélection : {{ sel ?? '—' }}<template v-if="added"> · créer : {{ added }}</template></span>
    </div>`,
  }),
} satisfies Meta<typeof McTree>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Chaque état d’un élément (McTreeItem seul), puis un arbre vide et un arbre tout déplié. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTree, McTreeItem, McIcon },
    setup: () => ({
      types,
      all: ref(['metier', 'fonctionnel', 'applicatif', 'technique', 'logiciel', 'bpmn']),
      sel: ref<string | null>('tomcat'),
    }),
    template: `<div style="display:grid;grid-template-columns:repeat(2,280px);gap:32px;align-items:start">
      <div class="mc-col" style="gap:8px">
        <span class="mc-over">Éléments</span>
        <div class="mc-tree" role="tree" aria-label="États">
          <McTreeItem label="Couche applicative (déplié)" layer="applicatif" group expandable expanded />
          <McTreeItem label="Repos" :level="1" :count="27" />
          <McTreeItem label="Survol, action visible" :level="1" :count="142" hover>
            <template #action><button type="button" class="mc-ibtn sm" aria-label="Créer un flux"><McIcon name="plus" size="sm" /></button></template>
          </McTreeItem>
          <McTreeItem label="Sélectionné" :level="1" :count="65" selected focusable />
          <McTreeItem label="Avec pictogramme" :level="1" icon="contract" layer="applicatif" :count="22" />
          <McTreeItem label="Couche technique (replié)" layer="technique" group expandable />
        </div>
      </div>
      <div class="mc-col" style="gap:8px">
        <span class="mc-over">Tout déplié, niveau 3</span>
        <McTree :nodes="types" v-model="sel" v-model:expanded="all" />
        <span class="mc-over" style="margin-top:16px">Arbre vide</span>
        <McTree :nodes="[]" />
        <p class="mc-cap" style="margin:0">Aucun type d’objet. Créez-en un depuis « Types d’objets ».</p>
      </div>
    </div>`,
  }),
}
