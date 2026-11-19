import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McBpmnDiagram from './McBpmnDiagram.vue'
import type { McBpmnModel } from './bpmn'

/** « Achat de fournitures » : y se compte depuis le haut de chaque couloir (240 de haut). */
const achat: McBpmnModel = {
  lanes: [
    { id: 'dem', label: 'Service demandeur' },
    { id: 'bud', label: 'Budget et marchés' },
    { id: 'cpt', label: 'Comptabilité et moyens' },
  ],
  nodes: [
    { id: 'start', kind: 'start', lane: 'dem', x: 90, y: 120, label: 'Besoin en fournitures' },
    { id: 'demande', kind: 'task', lane: 'dem', x: 209, y: 120, label: "Faire une demande d'achat" },
    { id: 'liste', kind: 'data', lane: 'dem', x: 209, y: 38, label: 'Liste des fournitures' },
    { id: 'approuver', kind: 'task', lane: 'bud', x: 309, y: 120, label: 'Approuver un achat' },
    { id: 'amande', kind: 'store', lane: 'bud', x: 309, y: 187, label: 'AMANDE' },
    { id: 'valide', kind: 'gateway', lane: 'bud', x: 436, y: 120, label: 'Commande validée ?' },
    { id: 'rejet', kind: 'end', lane: 'dem', x: 560, y: 80, label: 'Demande rejetée' },
    { id: 'commande', kind: 'task', lane: 'bud', x: 577, y: 120, label: 'Passer une commande' },
    { id: 'carambole', kind: 'store', lane: 'bud', x: 577, y: 187, label: 'CARAMBOLE' },
    { id: 'reception', kind: 'task', lane: 'dem', x: 717, y: 120, label: 'Réceptionner une livraison' },
    { id: 'bl', kind: 'data', lane: 'dem', x: 876, y: 120, label: 'Bon de livraison' },
    { id: 'facture', kind: 'task', lane: 'cpt', x: 717, y: 138, label: 'Enregistrer une facture' },
    { id: 'factu', kind: 'data', lane: 'cpt', x: 616, y: 40, label: 'Données de facturation' },
    { id: 'payer', kind: 'task', lane: 'cpt', x: 889, y: 138, label: 'Payer une facture' },
    { id: 'mandat', kind: 'data', lane: 'cpt', x: 889, y: 40, label: 'Mandat de paiement' },
    { id: 'maracuja', kind: 'store', lane: 'cpt', x: 1018, y: 138, label: 'MARACUJA' },
    { id: 'clore', kind: 'task', lane: 'bud', x: 889, y: 120, label: 'Clore une commande' },
    { id: 'fin', kind: 'end', lane: 'bud', x: 1024, y: 120, label: 'Achat terminé' },
  ],
  flows: [
    { from: 'start', to: 'demande', kind: 'sequence' },
    { from: 'demande', to: 'approuver', kind: 'sequence' },
    { from: 'approuver', to: 'valide', kind: 'sequence' },
    { from: 'valide', to: 'rejet', kind: 'sequence', label: 'non' },
    { from: 'valide', to: 'commande', kind: 'sequence', label: 'oui' },
    { from: 'commande', to: 'reception', kind: 'sequence' },
    { from: 'reception', to: 'facture', kind: 'sequence' },
    { from: 'facture', to: 'payer', kind: 'sequence' },
    { from: 'payer', to: 'clore', kind: 'sequence' },
    { from: 'clore', to: 'fin', kind: 'sequence' },
    { from: 'liste', to: 'demande', kind: 'association' },
    { from: 'approuver', to: 'amande', kind: 'association' },
    { from: 'commande', to: 'carambole', kind: 'association' },
    { from: 'reception', to: 'bl', kind: 'association' },
    { from: 'factu', to: 'facture', kind: 'association' },
    { from: 'payer', to: 'mandat', kind: 'association' },
    { from: 'payer', to: 'maracuja', kind: 'association' },
  ],
}

const meta = {
  title: 'Canevas/BpmnDiagram',
  component: McBpmnDiagram,
  args: { model: achat, title: 'Achat de fournitures', width: 1080, laneHeight: 240 },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Diagramme de processus BPMN 2.0 dans les couleurs du système, dessiné à partir d’un modèle typé : couloirs, éléments (`start`, `end`, `task`, `gateway`, `data`, `store`) et liens (`sequence` fléchée, `association` pointillée). Chaque élément donne son centre ; `y` se compte depuis le haut de son couloir. Les liens sont tracés à angle droit : droits quand les centres sont alignés, sinon vertical puis horizontal.\n\nLes **magasins de données sont les applications** de la cartographie : survol, focus (Tab) et clic ou Entrée émettent `select(id)` pour ouvrir leur inspecteur. La notation BPMN prime : on ne change que les couleurs.',
      },
    },
  },
  render: (args) => ({
    components: { McBpmnDiagram },
    setup: () => ({ args }),
    template: '<McBpmnDiagram v-bind="args" />',
  }),
} satisfies Meta<typeof McBpmnDiagram>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Clique sur AMANDE, CARAMBOLE ou MARACUJA : l’application est sélectionnée, comme pour ouvrir son inspecteur. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McBpmnDiagram },
    setup: () => {
      const selected = ref<string | null>('carambole')
      const model = computed<McBpmnModel>(() => ({
        ...achat,
        nodes: achat.nodes.map((n) => ({ ...n, selected: n.id === selected.value || (n.id === 'commande' && selected.value === 'carambole') })),
      }))
      const name = computed(() => achat.nodes.find((n) => n.id === selected.value)?.label)
      return { model, selected, name }
    },
    template: `<div class="mc-col" style="gap:12px">
      <p class="mc-cap" style="margin:0" aria-live="polite">{{ name ? 'Application sélectionnée : ' + name : 'Aucune application sélectionnée' }}</p>
      <McBpmnDiagram :model="model" title="Achat de fournitures" @select="(id) => (selected = selected === id ? null : id)" />
    </div>`,
  }),
}
