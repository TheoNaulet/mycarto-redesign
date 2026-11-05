import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SectorPicker from './SectorPicker.vue'
import { sectors } from '../../data/audiences'

const meta = {
  title: 'Navigation/SectorPicker (onglets)',
  component: SectorPicker,
  tags: ['autodocs'],
  parameters: {
    ground: 'navy',
    docs: {
      description: {
        component:
          'Les secteurs en onglets pastille sur navy (page Secteurs), avec le même focus itinérant que `RolePicker`. Chaque panneau montre le visuel du secteur, ses cartes clés et les clients qui l’utilisent.',
      },
    },
  },
  args: { sectors },
} satisfies Meta<typeof SectorPicker>

export default meta
export const Onglets: StoryObj<typeof meta> = {}
