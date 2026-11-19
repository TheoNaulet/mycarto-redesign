import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McStatusChip from './McStatusChip.vue'

const meta = {
  title: 'Repères/StatusChip',
  component: McStatusChip,
  args: { status: 'critical', size: 'md', default: 'Obsolète' },
  argTypes: { default: { control: 'text', description: 'Libellé (slot) : le fait, pas le jugement.' } },
  parameters: {
    docs: {
      description: {
        component:
          'Le seul endroit où le vert, l’orange et le rouge apparaissent. **Toujours une icône et un mot** (daltonisme, impression). Le libellé dit le fait : « Expire le 12/03/2027 », pas « Attention ».',
      },
    },
  },
  render: (args) => ({
    components: { McStatusChip },
    setup: () => ({ args }),
    template: '<McStatusChip v-bind="args">{{ args.default }}</McStatusChip>',
  }),
} satisfies Meta<typeof McStatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_niveaux: Story = {
  name: 'Tous les niveaux',
  render: () => ({
    components: { McStatusChip },
    template: `<div class="mc-col">
      <div class="mc-row"><McStatusChip status="ok">Non obsolète</McStatusChip><McStatusChip status="warn">Expire dans 4 mois</McStatusChip><McStatusChip status="critical">Obsolète</McStatusChip><McStatusChip status="unknown">Non renseigné</McStatusChip><McStatusChip>Prévue</McStatusChip></div>
      <div class="mc-row"><McStatusChip status="ok" size="sm">Valide</McStatusChip><McStatusChip status="warn" size="sm">Fin de support 2027</McStatusChip><McStatusChip status="critical" size="sm">Contrat expiré</McStatusChip><McStatusChip status="unknown" size="sm">NC</McStatusChip></div>
    </div>`,
  }),
}
