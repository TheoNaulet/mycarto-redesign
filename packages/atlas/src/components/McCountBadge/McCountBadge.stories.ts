import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McCountBadge from './McCountBadge.vue'

const meta = {
  title: 'Repères/CountBadge',
  component: McCountBadge,
  args: { count: 10, variant: 'default', max: 99, dot: false, label: '10 applications' },
  parameters: {
    docs: {
      description: {
        component:
          'Compteur numérique : nombre d’éléments dans un conteneur, notifications. Chiffres tabulaires, « 99+ » au-delà du maximum. Le libellé qui l’accompagne est toujours accordé : « 1 application », « 10 applications », jamais « application(s) ». Le mode `dot` est une pastille sans chiffre.',
      },
    },
  },
} satisfies Meta<typeof McCountBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McCountBadge },
    setup: () => ({ variants: ['default', 'strong', 'alert'] }),
    template: `<div class="mc-col">
      <table style="border-collapse:separate;border-spacing:16px 10px;font-size:12px;color:var(--ink-muted)">
        <thead><tr><th></th><th>0</th><th>1</th><th>26</th><th>99</th><th>1 250 (99+)</th></tr></thead>
        <tbody><tr v-for="v in variants" :key="v">
          <th style="text-align:left">{{ v }}</th>
          <td><McCountBadge :variant="v" :count="0" /></td>
          <td><McCountBadge :variant="v" :count="1" /></td>
          <td><McCountBadge :variant="v" :count="26" /></td>
          <td><McCountBadge :variant="v" :count="99" /></td>
          <td><McCountBadge :variant="v" :count="1250" /></td>
        </tr></tbody>
      </table>
      <div class="mc-row lg">
        <span class="mc-row">Pastille <McCountBadge dot label="Nouveautés" /></span>
        <span class="mc-row">Scolarité <McCountBadge :count="1" label="1 application" /><span class="mc-cap">1 application</span></span>
        <span class="mc-row">Ressources humaines <McCountBadge :count="10" label="10 applications" /><span class="mc-cap">10 applications</span></span>
        <span class="mc-row">Notifications <McCountBadge variant="alert" :count="3" label="3 notifications non lues" /></span>
      </div>
    </div>`,
  }),
}
