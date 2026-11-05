import type { Meta, StoryObj } from '@storybook/vue3-vite'
import InteropHub from './InteropHub.vue'

const meta = {
  title: 'Produit/InteropHub',
  component: InteropHub,
  tags: ['autodocs'],
  parameters: {
    ground: 'yellow',
    docs: {
      description: {
        component:
          'myCarto au centre des outils avec lesquels il échange par son API REST. Les outils se répartissent seuls sur le cercle, quel que soit leur nombre. À l’arrivée, chaque lien pousse depuis le centre puis son outil se pose au bout.',
      },
    },
  },
  args: { systems: ['CMDB', 'ITSM', 'PPM', 'BI', 'SI Finances', 'Connaissances', 'LDAP'] },
  render: (args) => ({
    components: { InteropHub },
    setup: () => ({ args }),
    template: '<div style="max-width:34rem;margin-inline:auto"><InteropHub v-bind="args" /></div>',
  }),
} satisfies Meta<typeof InteropHub>

export default meta
type Story = StoryObj<typeof meta>

export const Hub: Story = {}
export const QuatreOutils: Story = { args: { systems: ['CMDB', 'ITSM', 'BI', 'LDAP'] } }
