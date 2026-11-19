import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McSkeleton from './McSkeleton.vue'
import McSpinner from './McSpinner.vue'

const meta = {
  title: 'Données/Chargement',
  component: McSkeleton,
  args: { lines: 3, shape: 'line', gap: 8, label: 'Chargement' },
  parameters: {
    docs: {
      description: {
        component:
          'Deux indicateurs. **Squelette** (`McSkeleton`) quand on connaît la forme du contenu : lignes de tableau, paires clé/valeur, tuiles. **Roue** (`McSpinner`) pour une action courte : enregistrer, exporter. Jamais de voile blanc sur l’écran. Au-delà de 10 s, dire ce qui se passe (« Calcul de l’impact sur 312 objets… »).',
      },
    },
  },
  render: (args) => ({
    components: { McSkeleton },
    setup: () => ({ args }),
    template: '<div style="max-width:320px"><McSkeleton v-bind="args" /></div>',
  }),
} satisfies Meta<typeof McSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Lignes, bloc, cercle, largeurs variées, et la roue en deux tailles. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McSkeleton, McSpinner },
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;align-items:start">
      <div class="mc-col"><span class="mc-over">1 ligne</span><McSkeleton /></div>
      <div class="mc-col"><span class="mc-over">Paragraphe</span><McSkeleton :lines="4" /></div>
      <div class="mc-col"><span class="mc-over">Largeurs imposées</span><McSkeleton :lines="3" :width="['40%', '90%', 120]" :height="10" /></div>
      <div class="mc-col"><span class="mc-over">Bloc</span><McSkeleton shape="block" :height="104" :width="112" /></div>
      <div class="mc-col"><span class="mc-over">Cercle</span><McSkeleton shape="circle" :height="32" /></div>
      <div class="mc-col"><span class="mc-over">Roue</span>
        <div class="mc-row lg"><McSpinner size="sm" label="Enregistrement en cours" /><McSpinner label="Chargement de la carte" /></div>
      </div>
    </div>`,
  }),
}

/** Paires clé/valeur d'un inspecteur en cours de chargement. */
export const Inspecteur: Story = {
  render: () => ({
    components: { McSkeleton },
    template: `<div style="max-width:320px;display:grid;grid-template-columns:40% 1fr;gap:12px" aria-busy="true">
      <template v-for="i in 5" :key="i"><McSkeleton label="" :width="['70%']" /><McSkeleton label="" :width="i % 2 ? '90%' : '55%'" /></template>
    </div>`,
  }),
}

/** Roue seule, pour une action. */
export const Roue: Story = {
  render: () => ({
    components: { McSpinner },
    template: `<div class="mc-row" style="color:var(--ink-muted);font-size:13px"><McSpinner /><span>Calcul de l’impact sur 312 objets…</span></div>`,
  }),
}
