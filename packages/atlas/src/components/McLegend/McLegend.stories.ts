import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McLegend, { type McLegendSection } from './McLegend.vue'

const contrats: McLegendSection[] = [
  {
    title: 'Types',
    items: [
      { label: 'Contrat', count: 22, layer: 'applicatif' },
      { label: 'Fournisseur', count: 18, layer: 'applicatif' },
    ],
  },
  {
    title: 'Échéance des contrats',
    // Volontairement dans le désordre : la légende remet critique → sûr → non renseigné.
    items: [
      { id: 'plus-1-an', label: "Expire dans plus d'un an", count: 4, status: 'ok' },
      { id: 'nr', label: 'Date non renseignée', count: 0, status: 'unknown' },
      { id: 'expire', label: 'Expiré', count: 12, status: 'critical' },
      { id: 'moins-6-mois', label: 'Expire dans moins de 6 mois', count: 1, status: 'warn' },
      { id: '6-12-mois', label: 'Expire dans 6 à 12 mois', count: 5, swatch: { tone: 'warn', icon: 'calendar' } },
    ],
  },
]

const obsolescence: McLegendSection[] = [
  {
    title: 'Types',
    items: [
      { label: 'Logiciel', count: 31, layer: 'technique' },
      { label: 'Machine', count: 12, layer: 'technique' },
      { label: 'Application', count: 9, layer: 'applicatif' },
    ],
  },
  {
    title: 'Obsolescence',
    items: [
      { id: 'obso', label: 'Obsolète', count: 7, status: 'critical' },
      { id: 'fin', label: 'Fin de support sous un an', count: 4, status: 'warn' },
      { id: 'ok', label: 'Supporté', count: 29, status: 'ok' },
      { id: 'nc', label: 'Fin de support non renseignée', count: 3, status: 'unknown' },
    ],
  },
]

const meta = {
  title: 'Canevas/Legend',
  component: McLegend,
  args: { title: 'Légende', sections: contrats, closable: true, sort: true, isolated: null },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Légende générée à partir de ce qui est visible : les couches présentes, puis les niveaux de la lentille active avec leur nombre (qui suit les filtres). Chaque ligne est un bouton : elle **isole** ces objets sur la carte (`v-model:isolated`, événement `isolate`) et reste enfoncée ; un second clic réaffiche tout.\n\nLes niveaux sont toujours dans l’ordre du plus critique au plus sûr, « Non renseigné » en dernier (`sort`). Jamais de gabarit technique : un échantillon et un mot. Événement `close` (bouton Fermer).',
      },
    },
  },
  render: (args) => ({
    components: { McLegend },
    setup: () => ({ args }),
    template: '<McLegend v-bind="args" v-model:isolated="args.isolated" />',
  }),
} satisfies Meta<typeof McLegend>

export default meta
type Story = StoryObj<typeof meta>

/** Clique une ligne pour l’isoler ; les niveaux, donnés dans le désordre, sont remis dans l’ordre. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McLegend },
    setup: () => ({
      contrats,
      obsolescence,
      types: [contrats[0]!],
      iso: ref<string | null>('obso'),
      iso2: ref<string | null>(null),
      open: ref(true),
    }),
    template: `<div class="mc-row lg" style="align-items:flex-start;gap:24px">
      <div class="mc-col"><span class="mc-over">Une ligne isolée</span><McLegend :sections="obsolescence" v-model:isolated="iso" /></div>
      <div class="mc-col"><span class="mc-over">Sans lentille</span><McLegend :sections="types" v-model:isolated="iso2" /></div>
      <div class="mc-col"><span class="mc-over">Fermable</span>
        <McLegend v-if="open" :sections="contrats" @close="open = false" />
        <button v-else type="button" class="mc-btn outline sm" @click="open = true">Rouvrir la légende</button>
      </div>
    </div>`,
  }),
}
