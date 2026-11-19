import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McFlowNode from './McFlowNode.vue'

const meta = {
  title: 'Canevas/FlowNode',
  component: McFlowNode,
  args: { label: 'Maj des données étudiantes', meta: 'semestrielle', direction: 'one', variant: 'pill', width: 210 },
  argTypes: {
    direction: { control: 'inline-radio', options: ['one', 'both'] },
    variant: { control: 'inline-radio', options: ['pill', 'card'] },
  },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Le flux entre deux applications, posé au milieu de son lien. **Pilule** de 26px (largeur fixe, 210px par défaut) : pastille de sens (→ unidirectionnel, ⇄ bidirectionnel), libellé formulé comme une action, fréquence facultative. **Carte** de 220px : liste les données échangées, pour la carte « Les flux de… ».\n\nÉtats : repos, survol (contour accent, comme son lien), sélectionné, estompé. Événement : `select` (clic, Entrée, Espace).',
      },
    },
  },
  render: (args) => ({
    components: { McFlowNode },
    setup: () => ({ args }),
    template: '<McFlowNode v-bind="args" />',
  }),
} satisfies Meta<typeof McFlowNode>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McFlowNode },
    setup: () => {
      const picked = ref('auth')
      return { picked }
    },
    template: `<div class="mc-row lg" style="align-items:flex-start;gap:32px">
      <div class="mc-col">
        <span class="mc-over">Pilule</span>
        <McFlowNode label="Maj des données étudiantes" />
        <McFlowNode label="Échange annuaire" meta="quotidien" direction="both" />
        <McFlowNode label="Export des notes" hover />
        <McFlowNode label="Flux d'authentification" :selected="picked === 'auth'" @select="picked = picked === 'auth' ? '' : 'auth'" />
        <McFlowNode label="Synchronisation des emplois du temps" meta="horaire" />
        <McFlowNode label="Envoi des bourses" dimmed />
      </div>
      <div class="mc-col">
        <span class="mc-over">Carte</span>
        <McFlowNode variant="card" label="Liste des comptes étudiants à inscrire" meta="Synchrone · semestrielle"
          :data="[{ label: 'Données de santé', layer: 'fonctionnel' }, { label: 'Données factures' }]" />
        <McFlowNode variant="card" direction="both" label="Échange des dossiers agents" selected
          :data="[{ label: 'Dossier agent', layer: 'fonctionnel' }, { label: 'Éléments de paie', layer: 'fonctionnel' }, { label: 'Coordonnées bancaires' }]" />
        <McFlowNode variant="card" label="Envoi des bourses" />
      </div>
    </div>`,
  }),
}
