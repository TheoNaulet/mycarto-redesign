import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import RolePicker from './RolePicker.vue'
import { teamRoles } from '../../data/audiences'

const meta = {
  title: 'Navigation/RolePicker (onglets)',
  component: RolePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Des onglets en liste encadrée (page Métiers), suivant le motif ARIA « tabs » : flèches haut et bas, Début, Fin, focus itinérant (`useRovingTabs`). La scène garde la hauteur du rôle le plus long, la page ne saute pas. Le rôle actif est un `v-model`, relié à l’URL sur le site.',
      },
    },
  },
  args: { roles: teamRoles, modelValue: teamRoles[0].id },
  render: (args) => ({
    components: { RolePicker },
    setup: () => ({ roles: args.roles, active: ref(args.modelValue) }),
    template: '<RolePicker v-model="active" :roles="roles" />',
  }),
} satisfies Meta<typeof RolePicker>

export default meta
export const Onglets: StoryObj<typeof meta> = {}
